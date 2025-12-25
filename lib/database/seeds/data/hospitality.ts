/**
 * Bars, Clubs, Hospitality Seed Data
 *
 * VIP/Nightlife venue community with 8 members.
 * Represents an exclusive lounge's member community.
 */

import type { SeedTribeData } from "../types";

export const hospitalityData: SeedTribeData = {
  tribe: {
    name: "The Velvet Room - VIP Members",
    description:
      "Exclusive community for Velvet Room VIP members. Priority reservations, member-only events, and first access to special nights. Welcome to the inner circle.",
    location: "The Velvet Room, 888 Downtown Ave",
    privacy: "private",
    category: "social",
  },
  users: [
    // Owner (Venue Manager)
    {
      name: "Marcus Cole",
      email: "hospitality1@tribe-seed.test",
      role: "owner",
      avatarGender: "male",
    },
    // Admin (VIP Host)
    {
      name: "Jasmine Rivera",
      email: "hospitality2@tribe-seed.test",
      role: "admin",
      avatarGender: "female",
    },
    // Moderator (Senior VIP)
    {
      name: "Derek Hayes",
      email: "hospitality3@tribe-seed.test",
      role: "moderator",
      avatarGender: "male",
    },
    // Members (VIP Guests)
    {
      name: "Sophia Laurent",
      email: "hospitality4@tribe-seed.test",
      role: "member",
      avatarGender: "female",
    },
    {
      name: "Alexander Petrov",
      email: "hospitality5@tribe-seed.test",
      role: "member",
      avatarGender: "male",
    },
    {
      name: "Nicole Chang",
      email: "hospitality6@tribe-seed.test",
      role: "member",
      avatarGender: "female",
    },
    {
      name: "Ryan Mitchell",
      email: "hospitality7@tribe-seed.test",
      role: "member",
      avatarGender: "male",
    },
    {
      name: "Victoria Ellis",
      email: "hospitality8@tribe-seed.test",
      role: "member",
      avatarGender: "female",
    },
  ],
  posts: [
    {
      authorIndex: 0,
      content:
        "This Saturday: Grammy-winning DJ Kygo is doing an exclusive 2-hour set at Velvet Room. VIP members get early entry at 9pm before general admission at 11pm. Table reservations going fast - DM Jasmine to secure yours.",
      daysAgo: 12,
      comments: [
        {
          authorIndex: 3,
          content: "Just secured my table! Can't wait for this one.",
          daysAgo: 12,
        },
        {
          authorIndex: 5,
          content: "DM sent! Need a table for 6. This is going to be incredible.",
          daysAgo: 11,
        },
        {
          authorIndex: 1,
          content: "Nicole - got you! Check your messages for confirmation.",
          daysAgo: 11,
        },
      ],
    },
    {
      authorIndex: 1,
      content:
        "Kygo night was absolutely insane! Thank you to everyone who came out. The energy was unmatched. Special shoutout to our VIPs who always show up and show out.",
      daysAgo: 6,
      comments: [
        {
          authorIndex: 4,
          content: "Best night at Velvet Room yet! Already looking forward to the next one.",
          daysAgo: 6,
        },
        {
          authorIndex: 7,
          content: "The production was incredible. That light show!",
          daysAgo: 5,
        },
      ],
    },
    {
      authorIndex: 2,
      content:
        "Pro tip for new VIP members: Download the app and link your membership. Makes table ordering so much faster and you get notified about events before they're posted publicly.",
      daysAgo: 5,
    },
    {
      authorIndex: 0,
      content:
        "Exciting news: We're launching VIP Wine & Dine Wednesdays! Prix fixe dinner from our new executive chef paired with curated wines. Limited to 20 seats per week. Members only.",
      daysAgo: 4,
      comments: [
        {
          authorIndex: 3,
          content: "This is exactly what I've been wanting. Fine dining at our favorite spot? Yes please.",
          daysAgo: 4,
        },
        {
          authorIndex: 6,
          content: "What's the dress code? Looking forward to checking it out.",
          daysAgo: 4,
        },
        {
          authorIndex: 0,
          content: "Smart casual for Wine Wednesdays. More relaxed than weekend nights!",
          daysAgo: 3,
        },
      ],
    },
    {
      authorIndex: 4,
      content:
        "Celebrating my company's acquisition at Velvet this weekend. Looking to do something special - any recommendations from the team? Budget is flexible.",
      daysAgo: 3,
      comments: [
        {
          authorIndex: 1,
          content: "Congrats Alexander! DM me - we'll set up something memorable. Champagne tower perhaps?",
          daysAgo: 3,
        },
        {
          authorIndex: 0,
          content: "Big congrats! We've got you covered. This celebration is on us.",
          daysAgo: 2,
        },
      ],
    },
    {
      authorIndex: 1,
      content:
        "NYE tickets are now live for VIP members! 48-hour early access before public sale. Limited premium packages available with premium champagne and dedicated server.",
      daysAgo: 2,
      comments: [
        {
          authorIndex: 7,
          content: "Just grabbed 4 premium packages! Best decision of the year.",
          daysAgo: 2,
        },
        {
          authorIndex: 5,
          content: "This is why we pay for membership. Always first access to the best events!",
          daysAgo: 1,
        },
      ],
    },
    {
      authorIndex: 6,
      content:
        "Anyone else going to the cocktail masterclass next week? Heard they're teaching some of the signature drinks.",
      daysAgo: 1,
      comments: [
        {
          authorIndex: 3,
          content: "I'm signed up! Finally going to learn how they make that elderflower thing.",
          daysAgo: 1,
        },
      ],
    },
    {
      authorIndex: 0,
      content:
        "Weekend forecast: Friday is R&B classics night. Saturday we have a special guest - announcement coming tomorrow. Sunday is industry night - hospitality workers drink at cost. See you there!",
      daysAgo: 0,
    },
    {
      authorIndex: 2,
      content:
        "Left my jacket at my table last weekend (black Gucci bomber). Anyone seen it? Already messaged coat check but just in case.",
      daysAgo: 0,
      comments: [
        {
          authorIndex: 1,
          content: "Found it Derek! It's been kept safe. Swing by anytime to pick it up.",
          daysAgo: 0,
        },
      ],
    },
    {
      authorIndex: 5,
      content:
        "First time bringing a larger group this Friday (10 people). Any recommendations on bottle packages? Want to make sure everyone has a great first impression of the Velvet.",
      daysAgo: 0,
    },
  ],
  events: [
    {
      creatorIndex: 0,
      title: "Kygo - Exclusive VIP Set",
      description:
        "Grammy-winning DJ Kygo performs an exclusive 2-hour set at The Velvet Room. VIP members get early entry at 9pm.\n\nDress code: Upscale. No athletic wear.",
      location: "The Velvet Room, Main Floor",
      startDaysFromNow: -7,
      status: "completed",
      attendeeIndices: [0, 1, 2, 3, 4, 5, 6, 7],
    },
    {
      creatorIndex: 1,
      title: "VIP Wine & Dine Wednesday Launch",
      description:
        "Inaugural Wine & Dine Wednesday! 5-course tasting menu from Executive Chef Marco paired with premium wines. Limited to 20 seats.\n\nPrice: $150/person (member price)\nDress code: Smart casual",
      location: "The Velvet Room, Private Dining Room",
      startDaysFromNow: -3,
      status: "completed",
      attendeeIndices: [1, 3, 4, 6],
    },
    {
      creatorIndex: 1,
      title: "Cocktail Masterclass: Signature Series",
      description:
        "Learn to craft The Velvet Room's signature cocktails with our head mixologist. Includes tasting of 5 cocktails and recipe cards to take home.\n\nPrice: $75/person (member price)",
      location: "The Velvet Room, Lounge Bar",
      startDaysFromNow: 5,
      status: "upcoming",
      attendeeIndices: [3, 6],
    },
    {
      creatorIndex: 0,
      title: "New Year's Eve: Midnight at Velvet",
      description:
        "Ring in the New Year at The Velvet Room! Premium open bar, champagne toast at midnight, live DJ until 4am.\n\nVIP Package: $500/person (includes premium champagne, dedicated server)\nGeneral: $300/person",
      location: "The Velvet Room",
      startDaysFromNow: 38,
      status: "upcoming",
      attendeeIndices: [0, 1, 5, 7],
    },
  ],
};
