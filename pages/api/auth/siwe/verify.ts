import { getIronSession, IronSession, IronSessionData } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { SiweMessage, SiweErrorType } from "siwe";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session: IronSession<IronSessionData> =
    await getIronSession<IronSessionData>(req, res, sessionOptions);

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { message, signature } = req.body;

    if (!message || !signature) {
      return res.status(400).json({ message: "Missing message or signature" });
    }

    // Reconstruct the SiweMessage from the received message string
    const siweMessage = new SiweMessage(message);

    // Verify the signature and message integrity
    const fields = await siweMessage.verify({
      signature,
      nonce: session.nonce, // Compare against the nonce stored in the session
    });

    // Check if verification was successful and nonce matches
    if (fields.data.nonce !== session.nonce) {
      await session.destroy(); // Destroy session if nonce mismatch
      return res.status(422).json({ message: "Invalid nonce." });
    }

    // Nonce is valid, store the verified SIWE message in the session
    session.siwe = fields.data;
    // Clear the nonce after successful verification
    session.nonce = undefined;
    await session.save();

    console.log("SIWE verification successful, session saved:", session.siwe);

    // Respond with success
    res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error("SIWE Verification Error:", error);
    session.siwe = undefined;
    session.nonce = undefined;

    let errorMessage = "Verification failed";
    let statusCode = 500;

    // Check if it's a structured SIWE error by looking for a 'type' property
    const isSiweError =
      error &&
      typeof error === "object" &&
      "type" in error &&
      Object.values(SiweErrorType).includes(error.type as SiweErrorType);

    if (isSiweError) {
      const siweErrorType = error.type as SiweErrorType;
      // Handle specific SIWE errors
      switch (siweErrorType) {
        case SiweErrorType.EXPIRED_MESSAGE:
        case SiweErrorType.INVALID_NONCE: // Should be caught above, but good to handle
        case SiweErrorType.INVALID_SIGNATURE:
          statusCode = 422; // Unprocessable Entity
          errorMessage = `SIWE Error: ${siweErrorType}`;
          break;
        case SiweErrorType.NONCE_MISMATCH: // Already handled above, but for completeness
          statusCode = 422;
          errorMessage = "Invalid nonce.";
          break;
        default:
          errorMessage = `Unknown SIWE Error: ${siweErrorType}`;
          break;
      }
      await session.destroy(); // Destroy session on critical SIWE errors
    } else {
      // General server error or non-SIWE error object
      errorMessage = error?.message || "Unknown verification error";
      await session.save(); // Save the cleared session state
    }

    res.status(statusCode).json({ message: errorMessage });
  }
}
