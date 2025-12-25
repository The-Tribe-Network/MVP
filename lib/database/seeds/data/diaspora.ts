/**
 * Diaspora Communities Seed Data
 *
 * Cultural/heritage community with 8 members.
 * Represents a Nigerian diaspora community in a major US city.
 */

import type { SeedTribeData } from "../types";

export const diasporaData: SeedTribeData = {
  tribe: {
    name: "Naija Connect - Houston",
    description:
      "Connecting the Nigerian community in Houston. Celebrating our culture, supporting each other, and building lasting connections. Omo Naija no dey carry last!",
    location: "Houston, Texas",
    privacy: "private",
    category: "social",
  },
  users: [
    // Owner
    {
      name: "Chidi Okonkwo",
      email: "diaspora1@tribe-seed.test",
      role: "owner",
      avatarGender: "male",
    },
    // Admin
    {
      name: "Adaeze Nwosu",
      email: "diaspora2@tribe-seed.test",
      role: "admin",
      avatarGender: "female",
    },
    // Moderator
    {
      name: "Emeka Adeyemi",
      email: "diaspora3@tribe-seed.test",
      role: "moderator",
      avatarGender: "male",
    },
    // Members
    {
      name: "Ngozi Eze",
      email: "diaspora4@tribe-seed.test",
      role: "member",
      avatarGender: "female",
    },
    {
      name: "Tunde Bakare",
      email: "diaspora5@tribe-seed.test",
      role: "member",
      avatarGender: "male",
    },
    {
      name: "Amara Obi",
      email: "diaspora6@tribe-seed.test",
      role: "member",
      avatarGender: "female",
    },
    {
      name: "Olumide Afolabi",
      email: "diaspora7@tribe-seed.test",
      role: "member",
      avatarGender: "male",
    },
    {
      name: "Chisom Okeke",
      email: "diaspora8@tribe-seed.test",
      role: "member",
      avatarGender: "female",
    },
  ],
  posts: [
    {
      authorIndex: 0,
      content:
        "Independence Day celebration planning is in full swing! October 1st is around the corner. We're looking for volunteers for food, decorations, and entertainment. Drop a comment if you can help!",
      daysAgo: 12,
      comments: [
        {
          authorIndex: 1,
          content: "I can coordinate the jollof rice station. Already have my vendors lined up!",
          daysAgo: 12,
        },
        {
          authorIndex: 4,
          content: "Count me in for the DJ setup. Let's show them how Naija parties!",
          daysAgo: 11,
        },
        {
          authorIndex: 3,
          content: "I'll help with decorations. Green and white everywhere!",
          daysAgo: 11,
        },
      ],
    },
    {
      authorIndex: 1,
      content:
        "Welcome to our newest members who joined this month! Take a moment to introduce yourselves. We're a family here - don't be shy!",
      daysAgo: 10,
      comments: [
        {
          authorIndex: 7,
          content: "Hi everyone! Just moved to Houston from Atlanta. Excited to connect with the community here!",
          daysAgo: 10,
        },
        {
          authorIndex: 0,
          content: "Welcome Chisom! You're going to love it here. Make sure to come to our next meetup!",
          daysAgo: 9,
        },
      ],
    },
    {
      authorIndex: 2,
      content:
        "Shoutout to everyone who came to the owambe last weekend! The pepper soup was hitting different. Already planning the next one - any suggestions for venues?",
      daysAgo: 7,
      comments: [
        {
          authorIndex: 5,
          content: "That was so much fun! What about the community center in Sugarland? Heard they have a nice hall.",
          daysAgo: 7,
        },
        {
          authorIndex: 6,
          content: "The food was amazing as always. Shoutout to the aunties in the kitchen!",
          daysAgo: 6,
        },
      ],
    },
    {
      authorIndex: 3,
      content:
        "Looking for recommendations for authentic Nigerian restaurants in the Galleria area. Just moved nearby and craving proper egusi soup!",
      daysAgo: 5,
      comments: [
        {
          authorIndex: 2,
          content: "Try Finger Licking on Westheimer! Their egusi is the real deal.",
          daysAgo: 5,
        },
        {
          authorIndex: 4,
          content: "Naija Pot near Richmond is also solid. Ask for extra stockfish!",
          daysAgo: 5,
        },
      ],
    },
    {
      authorIndex: 4,
      content:
        "Anyone here in the tech industry? Looking to connect with fellow Nigerians in Houston's tech scene. Let's build a network!",
      daysAgo: 4,
    },
    {
      authorIndex: 5,
      content:
        "Kids' cultural program starting next month! Teaching Yoruba, Igbo, and Hausa languages on Saturdays. Ages 5-12. DM me if interested!",
      daysAgo: 3,
      comments: [
        {
          authorIndex: 1,
          content: "This is exactly what we need! My kids need to learn their mother tongue. Signing up!",
          daysAgo: 3,
        },
      ],
    },
    {
      authorIndex: 0,
      content:
        "Reminder: Monthly community meeting this Sunday at 3pm. We'll be discussing the December Christmas party and New Year plans. All ideas welcome!",
      daysAgo: 2,
    },
    {
      authorIndex: 6,
      content:
        "Just got my citizenship! Seven years in the making. Thank you to this community for all the support and advice along the way. We made it!",
      daysAgo: 1,
      comments: [
        {
          authorIndex: 0,
          content: "Congratulations!!! This calls for celebration. Drinks on us at the next meetup!",
          daysAgo: 1,
        },
        {
          authorIndex: 1,
          content: "So proud of you! The American dream is real!",
          daysAgo: 1,
        },
        {
          authorIndex: 3,
          content: "Congrats Olumide! Naija to the world!",
          daysAgo: 0,
        },
      ],
    },
    {
      authorIndex: 2,
      content:
        "Super Eagles match viewing party this Friday! Nigeria vs. South Africa. Location TBD but thinking Sports Bar on Westheimer. Who's in?",
      daysAgo: 0,
    },
    {
      authorIndex: 1,
      content:
        "PSA: Dr. Ademola's clinic is offering free health screenings for community members next Saturday. Blood pressure, glucose, the works. Let's take care of ourselves!",
      daysAgo: 0,
    },
  ],
  events: [
    {
      creatorIndex: 0,
      title: "Nigerian Independence Day Celebration",
      description:
        "Join us for our annual Independence Day celebration! Featuring traditional food, music, dancing, and cultural performances.\n\n- Jollof rice competition\n- Live band (Afrobeats & Highlife)\n- Cultural fashion show\n- Kids activities\n\nDress code: Traditional attire encouraged!",
      location: "Memorial Park Community Center, Houston",
      startDaysFromNow: -60,
      status: "completed",
      attendeeIndices: [0, 1, 2, 3, 4, 5, 6, 7],
    },
    {
      creatorIndex: 2,
      title: "Monthly Owambe - November Edition",
      description:
        "Our monthly get-together with food, music, and great company. Potluck style - bring a dish to share! This month's theme: Thanksgiving Naija Style.",
      location: "Private Residence (Address shared with attendees)",
      startDaysFromNow: -14,
      status: "completed",
      attendeeIndices: [0, 2, 3, 5, 6],
    },
    {
      creatorIndex: 0,
      title: "Community Monthly Meeting",
      description:
        "Monthly community meeting to discuss upcoming events, community initiatives, and member concerns. All members welcome and encouraged to attend.",
      location: "Virtual - Zoom link shared in chat",
      startDaysFromNow: 5,
      status: "upcoming",
      attendeeIndices: [0, 1, 2],
    },
    {
      creatorIndex: 1,
      title: "Christmas Party & End of Year Celebration",
      description:
        "End the year in style with your Naija family! Secret Santa, carol singing, and plenty of food. Kids welcome - Santa will be making an appearance!",
      location: "Grand Events Center, Sugarland",
      startDaysFromNow: 30,
      status: "upcoming",
      attendeeIndices: [0, 1, 2, 3, 4],
    },
  ],
};
