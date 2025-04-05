import { getIronSession, IronSession, IronSessionData } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { generateNonce } from "siwe";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session: IronSession<IronSessionData> =
    await getIronSession<IronSessionData>(req, res, sessionOptions);

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Generate a unique nonce
    session.nonce = generateNonce();
    // Save the session with the nonce
    await session.save();

    console.log("Generated and saved nonce:", session.nonce);

    // Send the nonce back to the client
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ nonce: session.nonce });
  } catch (error) {
    console.error("Error generating nonce:", error);
    res.status(500).json({ message: "Error generating nonce" });
  }
}
