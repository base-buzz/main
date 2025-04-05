import {
  User,
  Post,
  DirectMessage,
  Notification,
  Listing,
} from "@/types/interfaces";
import fs from "fs/promises";
import path from "path";

/**
 * Simple function to generate unique IDs
 */
export const generateId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

/**
 * Function to generate a random date within the last year
 */
const randomDate = (): string => {
  const now = new Date();
  const startDate = new Date(
    now.getFullYear() - 1,
    now.getMonth(),
    now.getDate(),
  );
  const timeDiff = now.getTime() - startDate.getTime();
  const randomTime = Math.random() * timeDiff;
  const date = new Date(startDate.getTime() + randomTime);
  return date.toISOString();
};

/**
 * Function to generate a random date of birth (18-70 years old)
 */
const randomDOB = (): string => {
  const now = new Date();
  const minYear = now.getFullYear() - 70;
  const maxYear = now.getFullYear() - 18;
  const year = minYear + Math.floor(Math.random() * (maxYear - minYear));
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1; // To avoid invalid dates

  return new Date(year, month - 1, day).toISOString().split("T")[0];
};

/**
 * Generate random users
 */
const generateUsers = (count: number): User[] => {
  const users: User[] = [];

  // Random bios
  const bios = [
    "Just here for the memes",
    "Crypto enthusiast and blockchain developer",
    "Building the future of web3",
    "NFT collector and digital art lover",
    "DeFi explorer and yield farmer",
    "Full-stack developer passionate about decentralization",
    "Passionate about privacy and security",
    "Early adopter of all things crypto",
    "Minting the future, one token at a time",
    "Web3 believer and community builder",
  ];

  // Random locations
  const locations = [
    "San Francisco, CA",
    "New York, NY",
    "London, UK",
    "Berlin, Germany",
    "Tokyo, Japan",
    "Singapore",
    "Toronto, Canada",
    "Sydney, Australia",
    "Paris, France",
    "Amsterdam, Netherlands",
  ];

  for (let i = 0; i < count; i++) {
    const id = generateId();
    users.push({
      id,
      alias: `user${i + 1}`,
      pfp: `https://source.unsplash.com/random/200x200?sig=${i}`,
      dob: randomDOB(),
      location: locations[Math.floor(Math.random() * locations.length)],
      headerImage: `https://source.unsplash.com/random/1500x500?sig=${i}`,
      bio: bios[Math.floor(Math.random() * bios.length)],
    });
  }

  return users;
};

/**
 * Generate random posts with comments
 */
const generatePosts = (users: User[], count: number): Post[] => {
  const posts: Post[] = [];
  const contents = [
    "Just minted my first NFT! #NFT #web3",
    "Excited about the latest developments in DeFi!",
    "Who else is bullish on $ETH?",
    "The future of finance is decentralized. #DeFi",
    "Learning Solidity has been a game-changer for me",
    "Just deployed my smart contract. Feels good!",
    "Web3 is the future of the internet",
    "DAOs are changing how we organize communities",
    "Gas fees are too high today 😩",
    "What are your favorite crypto projects right now?",
  ];

  for (let i = 0; i < count; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const id = generateId();
    const comments: Post[] = [];

    // Generate 0-5 comments per post
    const commentCount = Math.floor(Math.random() * 6);
    for (let j = 0; j < commentCount; j++) {
      const commentUser = users[Math.floor(Math.random() * users.length)];
      comments.push({
        id: generateId(),
        userId: commentUser.id,
        content: `This is a comment on post ${i + 1}. What do you think about ${randomUser.alias}'s post?`,
        createdAt: randomDate(),
        likes: Math.floor(Math.random() * 50),
        retweets: Math.floor(Math.random() * 20),
        comments: [], // No nested comments for simplicity
      });
    }

    posts.push({
      id,
      userId: randomUser.id,
      content: contents[Math.floor(Math.random() * contents.length)],
      createdAt: randomDate(),
      likes: Math.floor(Math.random() * 100),
      retweets: Math.floor(Math.random() * 50),
      media:
        Math.random() > 0.7
          ? [`https://source.unsplash.com/random/800x450?sig=${i}`]
          : undefined,
      comments,
      quoteTweet:
        Math.random() > 0.9 && posts.length > 0
          ? posts[Math.floor(Math.random() * posts.length)].id
          : undefined,
    });
  }

  return posts;
};

/**
 * Generate random direct messages
 */
const generateDMs = (users: User[], count: number): DirectMessage[] => {
  const dms: DirectMessage[] = [];

  for (let i = 0; i < count; i++) {
    const senderId = users[Math.floor(Math.random() * users.length)].id;
    let receiverId;

    // Ensure sender and receiver are different
    do {
      receiverId = users[Math.floor(Math.random() * users.length)].id;
    } while (senderId === receiverId);

    dms.push({
      id: generateId(),
      senderId,
      receiverId,
      message: `Hey! This is message ${i + 1}. Hope you're doing well!`,
      sentAt: randomDate(),
    });
  }

  return dms;
};

/**
 * Generate random notifications
 */
const generateNotifications = (
  users: User[],
  posts: Post[],
  count: number,
): Notification[] => {
  const notifications: Notification[] = [];
  const types: ("like" | "retweet" | "reply" | "quoteTweet")[] = [
    "like",
    "retweet",
    "reply",
    "quoteTweet",
  ];

  for (let i = 0; i < count; i++) {
    const userId = users[Math.floor(Math.random() * users.length)].id;
    const postId = posts[Math.floor(Math.random() * posts.length)].id;

    notifications.push({
      id: generateId(),
      userId,
      type: types[Math.floor(Math.random() * types.length)],
      postId,
      read: Math.random() > 0.5,
      createdAt: randomDate(),
    });
  }

  return notifications;
};

/**
 * Generate random listings
 */
const generateListings = (users: User[], count: number): Listing[] => {
  const listings: Listing[] = [];
  const categories: ("meme" | "project")[] = ["meme", "project"];
  const titles = [
    "Revolutionary DeFi Platform",
    "Hilarious Crypto Meme Collection",
    "Web3 Infrastructure Project",
    "NFT Marketplace for Digital Art",
    "DAO Governance Platform",
    "Crypto Trading Bot",
    "Blockchain Gaming Platform",
    "Decentralized Social Network",
    "Privacy-Focused Wallet",
    "Cross-Chain Bridge Solution",
  ];

  for (let i = 0; i < count; i++) {
    const userId = users[Math.floor(Math.random() * users.length)].id;
    const category = categories[Math.floor(Math.random() * categories.length)];

    listings.push({
      id: generateId(),
      userId,
      title: titles[Math.floor(Math.random() * titles.length)],
      description: `This is a ${category} listing. Check it out and let me know what you think!`,
      category,
      createdAt: randomDate(),
      media:
        Math.random() > 0.5
          ? [`https://source.unsplash.com/random/800x600?sig=${i}`]
          : undefined,
    });
  }

  return listings;
};

/**
 * Generate all mock data and write to JSON files
 */
export const generateAllMockData = async () => {
  try {
    const users = generateUsers(100);
    const posts = generatePosts(users, 200);
    const dms = generateDMs(users, 150);
    const notifications = generateNotifications(users, posts, 300);
    const listings = generateListings(users, 50);

    const dataDir = path.resolve(process.cwd(), "data");

    // Ensure data directory exists
    await fs.mkdir(dataDir, { recursive: true });

    // Write files
    await fs.writeFile(
      path.join(dataDir, "users.json"),
      JSON.stringify(users, null, 2),
    );

    await fs.writeFile(
      path.join(dataDir, "posts.json"),
      JSON.stringify(posts, null, 2),
    );

    await fs.writeFile(
      path.join(dataDir, "dms.json"),
      JSON.stringify(dms, null, 2),
    );

    await fs.writeFile(
      path.join(dataDir, "notifications.json"),
      JSON.stringify(notifications, null, 2),
    );

    await fs.writeFile(
      path.join(dataDir, "listings.json"),
      JSON.stringify(listings, null, 2),
    );

    console.log("Mock data generated successfully!");
  } catch (error) {
    console.error("Error generating mock data:", error);
  }
};

// Export individual generators for testing
export {
  generateUsers,
  generatePosts,
  generateDMs,
  generateNotifications,
  generateListings,
};
