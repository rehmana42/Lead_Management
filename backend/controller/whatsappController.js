import { error } from "qrcode-terminal";
import {
    getWhatsAppStatus,
    getWhatsAppQR,
    logoutWhatsApp,
    reconnectWhatsApp,
    getWhatsApp,
    whatsappReady,
    isWhatsAppReady,
} from "../config/whatsapp.js";


// ========================================
// GET STATUS
// ========================================

export const getWhatsAppStatusController =
    async (req, res) => {

        try {

            
            const status =
                getWhatsAppStatus();


                console.log(status)

            return res.json({

                success: true,

                data: status,

            });

        } catch (error) {

            console.error(error);

            res.json({success:false, error:e.message})

        }

    };


// ========================================
// GET QR
// ========================================

export const getWhatsAppQRController =
    async (req, res) => {

        try {

            const qr =
                getWhatsAppQR();

            if (!qr) {

                return res.status(404).json({

                    success: false,

                    message:
                        "QR code is not available",

                });

            }


            return res.status(200).json({

                success: true,

                qr,

            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message:
                    error.message,

            });

        }

    };


// ========================================
// LOGOUT
// ========================================

export const logoutWhatsAppController =
    async (req, res) => {

        try {

            const result =
                await logoutWhatsApp();


            if (!result.success) {

                return res.status(500).json(
                    result
                );

            }


            return res.status(200).json(
                result
            );

        } catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message:
                    "Failed to logout WhatsApp",

            });

        }

    };


// ========================================
// RECONNECT
// ========================================

export const reconnectWhatsAppController =
    async (req, res) => {

        try {

            const result =
                await reconnectWhatsApp();


            if (!result.success) {

                return res.status(500).json(
                    result
                );

            }


            return res.status(200).json(
                result
            );

        } catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message:
                    "Failed to reconnect WhatsApp",

            });

        }

    };





let addMemberInProgress = false;

export const addMember = async (req, res) => {
    if (addMemberInProgress) {
        return res.status(409).json({
            success: false,
            message: "Another group update is already running"
        });
    }

    addMemberInProgress = true;

    try {
        const { phone } = req.body;

        // ========================================
        // VALIDATE WHATSAPP CONNECTION
        // ========================================

        if (!isWhatsAppReady()) {
            return res.status(503).json({
                success: false,
                message: "WhatsApp is not connected"
            });
        }

        if (!Array.isArray(phone) || phone.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Phone must be a non-empty array"
            });
        }

        const sock = getWhatsApp();

        const groupId = "120363429442282527@g.us";

        // ========================================
        // GET EXISTING GROUP MEMBERS
        // ========================================

        const metadata = await sock.groupMetadata(groupId);

        const existingMembers = new Set();

        for (const member of metadata.participants) {
            if (member.id) {
                existingMembers.add(member.id);
            }

            if (member.phoneNumber) {
                existingMembers.add(member.phoneNumber);
            }
        }

        console.log(
            "Existing group members:",
            existingMembers.size
        );

        // ========================================
        // NORMALIZE PHONE NUMBERS
        // ========================================

        const participants = [];
        const skipped = [];
        const seen = new Set();

        const lidMapping = sock.signalRepository?.lidMapping;

        for (const number of phone) {
            let clean = String(number ?? "")
                .replace(/\D/g, "");

            // Add Indian country code
            if (clean.length === 10) {
                clean = `91${clean}`;
            }

            // Validate Indian mobile number
            if (!/^91[6-9]\d{9}$/.test(clean)) {
                skipped.push({
                    number,
                    reason: "Invalid mobile number"
                });

                continue;
            }

            const jid = `${clean}@s.whatsapp.net`;

            // ========================================
            // CHECK DUPLICATE INPUT
            // ========================================

            if (seen.has(jid)) {
                skipped.push({
                    number,
                    reason: "Duplicate number in request"
                });

                continue;
            }

            seen.add(jid);

            // ========================================
            // RESOLVE PHONE JID TO LID
            // ========================================

            let lid = null;

            try {
                if (
                    typeof lidMapping?.getLIDForPN === "function"
                ) {
                    lid = await lidMapping.getLIDForPN(jid);
                }
            } catch (error) {
                console.warn(
                    "LID mapping failed:",
                    error.message
                );
            }

            // ========================================
            // CHECK EXISTING GROUP MEMBER
            // ========================================

            const alreadyExists =
                existingMembers.has(jid) ||
                (lid && existingMembers.has(lid));

            if (alreadyExists) {
                skipped.push({
                    number,
                    reason: "Already in group"
                });

                continue;
            }

            // If group metadata contains unresolved LIDs,
            // we cannot safely confirm non-membership.
            // Avoid attempting to re-add unknown members.
            const unresolvedMembers =
                metadata.participants.some(
                    member =>
                        member.id?.endsWith("@lid") &&
                        !member.phoneNumber
                );

            if (
                unresolvedMembers &&
                !lidMapping?.getLIDForPN
            ) {
                skipped.push({
                    number,
                    reason:
                        "Cannot verify membership: LID mapping unavailable"
                });

                continue;
            }

            participants.push(jid);
        }

        // ========================================
        // NO NEW MEMBERS
        // ========================================

        if (participants.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No verified new members to add",
                added: [],
                failed: [],
                skipped
            });
        }

        // ========================================
        // ADD MEMBERS
        // ========================================

        console.log(
            `Attempting to add ${participants.length} members`
        );

        const result = await sock.groupParticipantsUpdate(
            groupId,
            participants,
            "add"
        );

        console.log(
            "Group update response:",
            JSON.stringify(result, null, 2)
        );

        // ========================================
        // PROCESS RESULTS
        // ========================================

        const added = [];
        const failed = [];

        for (const item of result ?? []) {
            if (String(item.status) === "200") {
                added.push(item);
            } else {
                failed.push(item);
            }
        }

        const rateLimited = failed.some(
            item => String(item.status) === "429"
        );

        return res.status(rateLimited ? 429 : 200).json({
            success: !rateLimited && failed.length === 0,
            rateLimited,

            message: rateLimited
                ? "WhatsApp rate limit reached. Stop additions and try again later."
                : `${added.length} added, ${failed.length} failed, ${skipped.length} skipped`,

            totalReceived: phone.length,
            totalAttempted: participants.length,

            added,
            failed,
            skipped
        });

    } catch (error) {
        const status =
            error.output?.statusCode ||
            error.statusCode ||
            500;

        console.error("Add member error:", {
            message: error.message,
            status,
            data: error.data,
            output: error.output
        });

        return res.status(status === 429 ? 429 : 500).json({
            success: false,
            rateLimited: status === 429,
            message: error.message
        });

    } finally {
        addMemberInProgress = false;
    }
};

