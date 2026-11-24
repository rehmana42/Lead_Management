import puppeteer from "puppeteer";
import { LeadModels } from "../models/LeadModel.js";
import { UserModel } from "../models/UserModel.js";
import { isWhatsAppReady, whatsapp } from "../config/whatsapp.js";






export const GenerateLead = async (req, res) => {
  let browser;

  const sleep = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  try {
    const { business, place, Limit } = req.query;

    const requestedLimit = Number.parseInt(Limit, 10);
    const limit = Math.min(
      Math.max(Number.isNaN(requestedLimit) ? 40 : requestedLimit, 1),
      200
    );

    if (
      typeof business !== "string" ||
      typeof place !== "string" ||
      !business.trim() ||
      !place.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Business and place are required.",
      });
    }

    browser = await puppeteer.launch({
      headless: true,
      defaultViewport: {
        width: 1080,
        height: 1024,
      },
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-extensions",
      ],
    });

    const optimizePage = async (page) => {
      await page.setRequestInterception(true);

      page.on("request", (request) => {
        if (["image", "font", "media"].includes(request.resourceType())) {
          request.abort();
        } else {
          request.continue();
        }
      });

      page.setDefaultNavigationTimeout(80000);
      page.setDefaultTimeout(30000);
    };

    const page = await browser.newPage();
    await optimizePage(page);

    const query = `${business.trim()} in ${place.trim()}`;

    await page.goto(
      `https://www.google.com/maps/search/${encodeURIComponent(query)}`,
      {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      }
    );

    await page.waitForSelector(
      '[role="feed"] a[href*="/maps/place/"]',
      { timeout: 15000 }
    );

    // Collect business links
    const businessMap = new Map();
    let unchangedCount = 0;

    while (businessMap.size < limit && unchangedCount < 6) {
      const links = await page.$$eval(
        '[role="feed"] a[href*="/maps/place/"]',
        (elements) =>
          elements.map((link) => ({
            name: link.getAttribute("aria-label"),
            url: link.href,
          }))
      );

      const previousCount = businessMap.size;

      for (const item of links) {
        if (
          item.url &&
          item.url.includes("/maps/place/") &&
          !businessMap.has(item.url)
        ) {
          businessMap.set(item.url, item);
        }

        if (businessMap.size >= limit) break;
      }

      if (businessMap.size >= limit) break;

      const reachedEnd = await page.evaluate(() => {
        const feed = document.querySelector('[role="feed"]');

        if (!feed) return true;

        const text = feed.innerText.toLowerCase();

        return (
          text.includes("you've reached the end of the list") ||
          text.includes("you have reached the end of the list")
        );
      });

      if (reachedEnd) break;

      const scrolled = await page.evaluate(() => {
        const feed = document.querySelector('[role="feed"]');

        if (!feed) return false;

        feed.scrollBy({
          top: 1400,
          behavior: "instant",
        });

        return true;
      });

      if (!scrolled) break;

      await sleep(900);

      const newLinks = await page.$$eval(
        '[role="feed"] a[href*="/maps/place/"]',
        (elements) =>
          elements.map((link) => ({
            name: link.getAttribute("aria-label"),
            url: link.href,
          }))
      );

      for (const item of newLinks) {
        if (
          item.url &&
          item.url.includes("/maps/place/") &&
          !businessMap.has(item.url)
        ) {
          businessMap.set(item.url, item);
        }

        if (businessMap.size >= limit) break;
      }

      if (businessMap.size === previousCount) {
        unchangedCount++;
      } else {
        unchangedCount = 0;
      }
    }

    const uniqueBusinesses = [
      ...businessMap.values(),
    ].slice(0, limit);

    await page.close();

    // Extract business details
    const scrapeBusiness = async (workerPage, business) => {
      await workerPage.goto(business.url, {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      });

      await workerPage.waitForSelector("h1", {
        timeout: 8000,
      });

      await workerPage
        .waitForFunction(
          () =>
            document.querySelector('[data-item-id^="phone:tel:"]') ||
            document.querySelector('a[href^="tel:"]'),
          { timeout: 6000 }
        )
        .catch(() => {});

      const details = await workerPage.evaluate(() => {
        const getText = (selector) => {
          const element = document.querySelector(selector);
          return element?.innerText?.trim() || null;
        };

        const getLink = (selector) => {
          const element = document.querySelector(selector);
          return element?.href || null;
        };

        const phoneElement = document.querySelector(
          '[data-item-id^="phone:tel:"]'
        );

        const phone =
          document
            .querySelector('a[href^="tel:"]')
            ?.getAttribute("href")
            ?.replace(/^tel:/i, "")
            ?.trim() ||
          phoneElement
            ?.getAttribute("data-item-id")
            ?.replace(/^phone:tel:/i, "")
            ?.trim() ||
          null;

        const ratingElement = document.querySelector(
          '[role="img"][aria-label*="stars"]'
        );

        return {
          name: getText("h1"),
          phone,
          website: getLink('a[data-item-id="authority"]'),
          address: getText('[data-item-id="address"]'),
          rating: ratingElement?.getAttribute("aria-label") || null,
        };
      });

      return {
        ...details,
        name: details.name || business.name,
        mapsUrl: business.url,
      };
    };

    // Parallel scraping
    const results = [];
    const CONCURRENCY = 3;

    let currentIndex = 0;

    const worker = async () => {
      const workerPage = await browser.newPage();
      await optimizePage(workerPage);

      try {
        while (true) {
          const index = currentIndex++;

          if (index >= uniqueBusinesses.length) break;

          const business = uniqueBusinesses[index];

          try {
            const details = await scrapeBusiness(
              workerPage,
              business
            );

            // Only save businesses having a phone number
            if (details.phone) {
              results.push(details);
            }
          } catch {
            // Skip businesses that fail to load or have no extracted details
          }
        }
      } finally {
        await workerPage.close().catch(() => {});
      }
    };

    const workerCount = Math.min(
      CONCURRENCY,
      uniqueBusinesses.length
    );

    await Promise.all(
      Array.from({ length: workerCount }, () => worker())
    );

    return res.status(200).json({
      success: true,
      requested: limit,
      total: results.length,
      leads: results,
    });

  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to generate leads.",
    });
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
};



export const SaveLead = async (req, res) => {
  try {
    const { leads } = req.body;

   
    const user=await UserModel.findOne({_id:req.userId.id}).populate({
      path:"leads"
    })
    const allLeads=user.leads
    console.log("All Leads bolte")
    console.log(allLeads);
    const saveLeads = [];

    for (const e of leads) {

      // Check if lead already exists
      const exists = allLeads.some(
        (ele) => ele.name === e.name
      );

      // Skip duplicate
      if (exists) continue;

      // Save new lead
      const saved = await LeadModels.create({
        name: e.name,
        phone: e.phone ?? "",
        website: e.website ?? "",
        address: e.address ?? "",
        rating: e.rating ?? "",
        mapsUrl: e.mapsUrl ?? "",
        reminderUserId:req.userId.id
      });
      console.log("kuch bhi ")
      
     console.log(saved._id)
     user.leads.push(saved._id)
     await user.save()
      saveLeads.push(saved);

      // // Prevent duplicates within incoming leads too
      // allLeads.push(saved);
    }

    return res.json({
      success: true,
      saveLeads,
    });

  } catch (e) {
    console.log(e.message)
    return res.json({
      success: false,
      error: e.message,
    });
  }
};

// get lead

export const getLeads=async(req,res)=>{
  try{
    
    const user=await UserModel.findOne({_id:req.userId.id}).populate(
      {
      path:"leads",
      match:{intrested:true},}
    )

    // console.log(user.leads.reverse())

   const leads=await LeadModels.find()
   console.log(leads.reverse())
   
   res.json({success:true, "leads":user.leads.reverse()})
  }
  catch(e){
    console.log(e.message)
  }
}

// set Reminder
export const setReminder=async(req,res)=>{
  try{
    const{id, reminderDate}=req.body
      console.log(id, reminderDate)
    const leads=await LeadModels.findOneAndUpdate(
      
      {_id:id},
      {
        $set:{
          reminder:reminderDate,
          reminderSend:false
        }
      },
      {new:true}
    )

      console.log(leads)
   
    res.json({success:true,data:"reminder set successfully"})

  }
  catch(e){
    console.log(e.message)
    res.json({success:false, error:e.message})
  }
}

//set not intrested
export const notIntrested=async(req,res)=>{
  try{
    const {id}=req.body
      const leads=await LeadModels.findOneAndUpdate(
        {_id:id},
  {$set:{intrested:false }},
  {new:true}
)
 console.log(leads)
 res.json({success:true,data:"lead updated successfully"})

  }
  catch(e){
    console.log(e.message)
    res.json({success:false,error:e.message})
  }
}


//set as converted 
export const setConverted=async(req,res)=>{
  try{
    const {id}=req.body
    console.log(`id bolte lala chori  ${id}` )
     const updatedlead=await LeadModels.findOneAndUpdate({_id:id},{$set:{converted:true}}, {returnDocument: 'after'})
 console.log(updatedlead)
     res.json({success:true, data:"lead converted successfully "})
  }
   catch(e){
    console.log(e.message )
    res.json({success:false, error:e.message})
   }
}




// ------------------ send whatsApp message 
export const SendMessage=async(req,res)=>{
    try{
      const {lead}=req.body
      const leads =await LeadModels.findOne({_id:lead._id})
      if(leads.msgSend === true){
return res.json({success:false, error:'Message ALready sended'});
      }
       
        if (!isWhatsAppReady()) {
          
          return res.json({success:false, error:'whatsapp is not connected'});
        }


           if (!leads.phone) {
          console.log("Phone missing:", lead.name);
          return res.json({success:false, error:"number is not provided"})
      
        }

        
                let phone = String(leads.phone)
          .replace(/\D/g, "")     // Remove spaces, +, hyphens, etc.
          .replace(/^0+/, "");    // Remove all starting zeros
        
        console.log(phone);
        
                // Add India country code if necessary
                if (phone.length === 10) {
                  phone = `91${phone}`;
                }
        
                if (!/^91[6-9]\d{9}$/.test(phone)) {
                 return res.json({success:false, error:"Phone number is invalid "})
                  
                }
        
                // ==================================
                // CHECK WHATSAPP NUMBER
                // ==================================
        
                const jid = `${phone}@s.whatsapp.net`;
        
                console.log("Checking number:", jid);
        
                const registered = await whatsapp.onWhatsApp(jid);
        
                console.log("WhatsApp registration:", registered);
        
                if (!registered?.[0]?.exists) {
                  console.log("Number not registered:", phone);
                   return res.json({success:false, error:"number is not registered"})
                }
        
                const recipientJid = registered[0].jid || jid;
        
                // ==================================
                // GENERATE AI MESSAGE
                // ==================================
        
                const message1 =`
                Hello ${lead.name} 👋

I came across your company and wanted to connect.

I'm a Full Stack Developer specializing in building modern, responsive web applications, business management systems, CRM solutions, and custom software.

I work with technologies like React.js, Node.js, Express.js, MongoDB, and Flutter.

I'd love to explore opportunities where I can contribute to your company's technical projects, help build scalable solutions, and solve real-world business challenges.

Are you currently looking for a Full Stack Developer or open to collaborating with one?

For more information about my skills and projects, please visit my portfolio:

https://rehmandeveloper.vercel.app/?test=98765

Looking forward to connecting with you! 🤝
                `

const message=`Hello ${lead.name} 👋

I came across your business and wanted to connect with you.

I help local businesses build a stronger digital presence and simplify their daily operations through technology.

I can help you with:

🌐 Professional Business Websites
📱 Custom Web & Mobile Applications
📊 Business Management Systems
👥 CRM & Customer Management
🤖 WhatsApp & Business Automation
📈 Lead Generation & Digital Solutions

My goal is to help businesses attract more customers, save time, reduce manual work, and grow more efficiently.

I'd love to understand your business and explore how technology could help you improve your operations.

Would you be interested in discussing some ideas for your business?

Portfolio: https://rehmandeveloper.vercel.app/?test=98765

Looking forward to connecting! 🤝`
        
               
        
              
        
                // ==================================
                // SEND MESSAGE
                // ==================================
        
                console.log("Sending to:", recipientJid);
        
                const result = await whatsapp.sendMessage(
                  recipientJid,
                  {
                    text: message,
                  }
                );

//                const result = await whatsapp.sendMessage(
//                 recipientJid,
//                 {
//   document: {
//     url: 'Abdul_fullstack_developer.pdf',
//   },
//   mimetype: 'application/pdf',
//   fileName: 'Abdul_fullstack_developer.pdf',
//   caption: message1
// });
                console.log("Baileys response:", result);

              
               
                
                          await LeadModels.findByIdAndUpdate(
                            lead._id,
                            {
                              $set: {
                                msgSend: true,
                              },
                            }
                          );
                
                         
                
                          console.log("Message submitted:", lead.name);
                
                        
                          res.json({success:true , data:"message send success"})

    }
    catch(e){
      console.log(e.message )
      res.json({success:false, error :e.message})
    }
}



// sect carllNotReceived
export const setCallNotReceived=async(req,res)=>{
  try{
    const{id}=req.body
    const updatedLead=await LeadModels.findByIdAndUpdate({_id:id},{
      $set:{
        callNotReceived:true
      }
    }, {returnDocument: 'after'})
    console.log(updatedLead)
    if(updatedLead){
      return res.json({success:true,data:"Updated Successfully"})
    }
  }
  catch(e){
    res.json({success:false,error:e.message})
    console.log(e.message)
  }
}