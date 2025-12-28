/**
 * Home Dashboard Seed Data
 *
 * Seed data matching the mock data from the home dashboard.
 * 4 tribes with realistic users, posts, comments, likes, and events.
 */

import type { SeedTribeData } from "../types";
import { SEED_EMAIL_DOMAIN } from "../utils";

// Helper to generate email
const email = (index: number) => `home${index}${SEED_EMAIL_DOMAIN}`;

// ============================================================================
// FAMILY SQUAD (6 members, 8 posts)
// ============================================================================

export const familySquadData: SeedTribeData = {
  tribe: {
    name: "Family Squad",
    description:
      "Our family group for coordinating gatherings, sharing memories, and staying connected across generations.",
    location: "Nationwide",
    privacy: "private",
    category: "family",
  },
  users: [
    { name: "Sarah Chen", email: email(1), role: "owner", avatarGender: "female" },
    { name: "Alex Kim", email: email(2), role: "member", avatarGender: "male" },
    { name: "David Lee", email: email(3), role: "member", avatarGender: "male" },
    { name: "Olivia Martinez", email: email(4), role: "member", avatarGender: "female" },
    { name: "Jennifer Chen", email: email(5), role: "member", avatarGender: "female" },
    { name: "Robert Chen", email: email(6), role: "member", avatarGender: "male" },
  ],
  posts: [
    {
      authorIndex: 0, // Sarah Chen
      content: "Just finished the hiking trail! Amazing views 🏔️",
      daysAgo: 0,
      likerIndices: [1, 2, 3, 4, 5],
      comments: [
        { authorIndex: 3, content: "This looks amazing! We should do this again.", daysAgo: 0 },
        { authorIndex: 4, content: "Beautiful! Where is this?", daysAgo: 0 },
        { authorIndex: 5, content: "Great shot! 📸", daysAgo: 0 },
      ],
    },
    {
      authorIndex: 4, // Jennifer Chen
      content: "Happy birthday to our amazing dad! 🎂 Love you so much!",
      daysAgo: 2,
      likerIndices: [0, 1, 2, 3, 5],
      comments: [
        { authorIndex: 0, content: "Happy birthday Dad! 🎉", daysAgo: 2 },
        { authorIndex: 5, content: "The best dad ever!", daysAgo: 2 },
        { authorIndex: 2, content: "Many more years of health and happiness!", daysAgo: 2 },
        { authorIndex: 3, content: "Love you grandpa! ❤️", daysAgo: 2 },
      ],
    },
    {
      authorIndex: 2, // David Lee
      content: "Family game night was a blast last weekend! Who's up for round 2?",
      daysAgo: 5,
      likerIndices: [0, 3, 4, 5],
      comments: [
        { authorIndex: 0, content: "I'm in! But no more Monopoly 😅", daysAgo: 5 },
        { authorIndex: 1, content: "Count me in!", daysAgo: 5 },
      ],
    },
    {
      authorIndex: 3, // Olivia Martinez
      content: "Sunday brunch at mom's place - who's bringing dessert?",
      daysAgo: 3,
      likerIndices: [0, 1, 2, 4, 5],
      comments: [
        { authorIndex: 4, content: "I'll make my famous brownies!", daysAgo: 3 },
        { authorIndex: 0, content: "Yay! I'll bring fruit salad", daysAgo: 3 },
        { authorIndex: 5, content: "Ice cream duty here 🍦", daysAgo: 3 },
        { authorIndex: 1, content: "Can't wait!", daysAgo: 3 },
        { authorIndex: 2, content: "See everyone there!", daysAgo: 3 },
      ],
    },
    {
      authorIndex: 5, // Robert Chen
      content: "Just booked the cabin for our summer trip! 🏕️ Mark your calendars: July 15-22",
      daysAgo: 7,
      likerIndices: [0, 1, 2, 3, 4],
      comments: [
        { authorIndex: 0, content: "So excited for this!", daysAgo: 7 },
        { authorIndex: 4, content: "Best uncle ever! 🎉", daysAgo: 7 },
        { authorIndex: 3, content: "Already packing my bags!", daysAgo: 7 },
        { authorIndex: 2, content: "This is going to be amazing", daysAgo: 7 },
      ],
    },
    {
      authorIndex: 1, // Alex Kim
      content: "Movie night vote: comedy or action? Cast your votes below!",
      daysAgo: 1,
      likerIndices: [0, 2, 3, 4],
      comments: [
        { authorIndex: 0, content: "Comedy! 🎬", daysAgo: 1 },
        { authorIndex: 2, content: "Action for sure!", daysAgo: 1 },
        { authorIndex: 4, content: "Comedy please!", daysAgo: 1 },
        { authorIndex: 3, content: "How about both? Double feature!", daysAgo: 1 },
        { authorIndex: 5, content: "I'm good with anything!", daysAgo: 1 },
        { authorIndex: 1, content: "Double feature it is!", daysAgo: 1 },
      ],
    },
    {
      authorIndex: 0, // Sarah Chen
      content:
        "Grandma's 80th birthday is next month - let's start planning the surprise party!",
      daysAgo: 10,
      likerIndices: [1, 2, 3, 4, 5],
      comments: [
        { authorIndex: 4, content: "I can handle the decorations!", daysAgo: 10 },
        { authorIndex: 5, content: "I'll order the cake", daysAgo: 10 },
        { authorIndex: 2, content: "Music and playlist duty here 🎵", daysAgo: 10 },
        { authorIndex: 3, content: "This is going to be so special!", daysAgo: 10 },
        { authorIndex: 1, content: "Count me in for setup help", daysAgo: 10 },
      ],
    },
    {
      authorIndex: 2, // David Lee
      content: "Photos from last week's BBQ are up! Check the album 📸",
      daysAgo: 4,
      likerIndices: [0, 3, 4, 5],
      comments: [
        { authorIndex: 0, content: "Great pics! That one of grandpa is hilarious 😂", daysAgo: 4 },
        { authorIndex: 4, content: "Love them all!", daysAgo: 4 },
      ],
    },
  ],
  events: [
    {
      creatorIndex: 0,
      title: "Family Dinner",
      description: "Monthly family dinner at mom's place. Bring your favorite dish!",
      location: "Mom's House",
      startDaysFromNow: 4,
      status: "upcoming",
      attendeeIndices: [0, 1, 2, 3, 4, 5],
    },
    {
      creatorIndex: 0,
      title: "Birthday Celebration",
      description: "Grandma's 80th birthday surprise party! Shhh, it's a secret!",
      location: "Community Center",
      startDaysFromNow: 5,
      status: "upcoming",
      attendeeIndices: [0, 1, 2, 3, 4, 5],
    },
  ],
};

// ============================================================================
// WORK CREW (8 members, 9 posts)
// ============================================================================

export const workCrewData: SeedTribeData = {
  tribe: {
    name: "Work Crew",
    description:
      "Team collaboration space for our department. Share updates, coordinate projects, and stay connected.",
    location: "San Francisco, CA",
    privacy: "private",
    category: "work",
  },
  users: [
    { name: "Mike Johnson", email: email(7), role: "owner", avatarGender: "male" },
    { name: "James Wilson", email: email(8), role: "member", avatarGender: "male" },
    { name: "Ryan Thompson", email: email(9), role: "moderator", avatarGender: "male" },
    { name: "Amanda Foster", email: email(10), role: "member", avatarGender: "female" },
    { name: "Kevin Park", email: email(11), role: "member", avatarGender: "male" },
    { name: "Rachel Green", email: email(12), role: "member", avatarGender: "female" },
    { name: "Tom Bradley", email: email(13), role: "member", avatarGender: "male" },
    { name: "Sophia Adams", email: email(14), role: "member", avatarGender: "female" },
  ],
  posts: [
    {
      authorIndex: 1, // James Wilson
      content: "Looking forward to the team meeting tomorrow! Got some exciting updates to share.",
      daysAgo: 0,
      likerIndices: [0, 2, 3, 4, 5],
      comments: [
        { authorIndex: 0, content: "Can't wait to hear them!", daysAgo: 0 },
        { authorIndex: 3, content: "Looking forward to it! 🎉", daysAgo: 0 },
      ],
    },
    {
      authorIndex: 0, // Mike Johnson
      content:
        "Great job everyone on the Q4 presentation! Client was impressed. Drinks on me Friday! 🎉",
      daysAgo: 3,
      likerIndices: [1, 2, 3, 4, 5, 6, 7],
      comments: [
        { authorIndex: 1, content: "Team effort! 💪", daysAgo: 3 },
        { authorIndex: 3, content: "We crushed it!", daysAgo: 3 },
        { authorIndex: 5, content: "Couldn't have done it without everyone", daysAgo: 3 },
        { authorIndex: 6, content: "Friday can't come soon enough!", daysAgo: 3 },
        { authorIndex: 7, content: "Best team ever! 🙌", daysAgo: 3 },
      ],
    },
    {
      authorIndex: 3, // Amanda Foster
      content:
        "Welcome to the team, Sophia! 🎉 So glad to have you on board. Everyone say hi!",
      daysAgo: 7,
      likerIndices: [0, 1, 2, 4, 5, 6, 7],
      comments: [
        { authorIndex: 0, content: "Welcome Sophia! Great to have you!", daysAgo: 7 },
        { authorIndex: 7, content: "Thanks everyone! So excited to be here! 😊", daysAgo: 7 },
        { authorIndex: 5, content: "Welcome! Let's grab coffee sometime", daysAgo: 7 },
      ],
    },
    {
      authorIndex: 4, // Kevin Park
      content: "Lunch run to that new Thai place - anyone in? Leaving at 12:30",
      daysAgo: 1,
      likerIndices: [1, 2, 5, 6],
      comments: [
        { authorIndex: 5, content: "Count me in!", daysAgo: 1 },
        { authorIndex: 1, content: "Save me a spot!", daysAgo: 1 },
        { authorIndex: 6, content: "I've heard great things about their pad thai", daysAgo: 1 },
        { authorIndex: 2, content: "Be there!", daysAgo: 1 },
      ],
    },
    {
      authorIndex: 2, // Ryan Thompson
      content: "Reminder: Time sheets due by Friday EOD. Please submit on time!",
      daysAgo: 2,
      likerIndices: [0, 3, 7],
      comments: [{ authorIndex: 0, content: "Thanks for the reminder!", daysAgo: 2 }],
    },
    {
      authorIndex: 5, // Rachel Green
      content: "Team happy hour this Thursday at 5pm! 🍻 Rooftop bar downtown. Who's joining?",
      daysAgo: 4,
      likerIndices: [0, 1, 2, 3, 4, 6, 7],
      comments: [
        { authorIndex: 0, content: "I'm there!", daysAgo: 4 },
        { authorIndex: 1, content: "Wouldn't miss it!", daysAgo: 4 },
        { authorIndex: 3, content: "Perfect way to end the week!", daysAgo: 4 },
        { authorIndex: 4, content: "First round is on me!", daysAgo: 4 },
        { authorIndex: 6, content: "See everyone there!", daysAgo: 4 },
        { authorIndex: 7, content: "Can't wait! 🎉", daysAgo: 4 },
      ],
    },
    {
      authorIndex: 0, // Mike Johnson
      content:
        "Congrats to the dev team on shipping the new feature ahead of schedule! Outstanding work! 🚀",
      daysAgo: 6,
      likerIndices: [1, 2, 3, 4, 5, 6, 7],
      comments: [
        { authorIndex: 1, content: "Thank you! Team effort all the way!", daysAgo: 6 },
        { authorIndex: 4, content: "Thanks boss! 🙏", daysAgo: 6 },
        { authorIndex: 6, content: "Couldn't have done it without the QA team!", daysAgo: 6 },
        { authorIndex: 7, content: "Happy to be part of this amazing team!", daysAgo: 6 },
      ],
    },
    {
      authorIndex: 7, // Sophia Adams
      content: "Office plants are looking sad - who's on watering duty this week? 🌱",
      daysAgo: 5,
      likerIndices: [2, 3, 5, 6],
      comments: [
        { authorIndex: 5, content: "Oops, that might be me 😅", daysAgo: 5 },
        { authorIndex: 3, content: "I can take over this week!", daysAgo: 5 },
        { authorIndex: 2, content: "Maybe we need a schedule?", daysAgo: 5 },
      ],
    },
    {
      authorIndex: 6, // Tom Bradley
      content: "New coffee machine in the break room - life changing ☕ Who else has tried it?",
      daysAgo: 8,
      likerIndices: [0, 1, 3, 4, 5, 7],
      comments: [
        { authorIndex: 0, content: "Best investment we've made!", daysAgo: 8 },
        { authorIndex: 3, content: "The espresso is incredible!", daysAgo: 8 },
        { authorIndex: 5, content: "I'm on my third cup today 😆", daysAgo: 8 },
        { authorIndex: 7, content: "RIP my productivity after 3pm ☕", daysAgo: 8 },
        { authorIndex: 1, content: "Worth every penny!", daysAgo: 8 },
      ],
    },
  ],
  events: [
    {
      creatorIndex: 0,
      title: "Team Meeting",
      description: "Weekly team sync-up. Come prepared with your updates and blockers.",
      location: "Conference Room A",
      startDaysFromNow: 6,
      status: "upcoming",
      attendeeIndices: [0, 1, 2, 3, 4, 5, 6, 7],
    },
  ],
};

// ============================================================================
// COLLEGE FRIENDS (8 members including Sarah Chen cross-tribe, 8 posts)
// ============================================================================

export const collegeFriendsData: SeedTribeData = {
  tribe: {
    name: "College Friends",
    description:
      "Class of 2019 forever! Stay connected, plan reunions, and share memories from the good old days.",
    location: "UC Berkeley Alumni",
    privacy: "private",
    category: "social",
  },
  users: [
    { name: "Emma Davis", email: email(15), role: "owner", avatarGender: "female" },
    { name: "Lisa Park", email: email(16), role: "member", avatarGender: "female" },
    // Sarah Chen (email(1)) will be added as cross-tribe member
    { name: "Chris Taylor", email: email(17), role: "member", avatarGender: "male" },
    { name: "Megan White", email: email(18), role: "member", avatarGender: "female" },
    { name: "Josh Miller", email: email(19), role: "member", avatarGender: "male" },
    { name: "Nicole Brown", email: email(20), role: "member", avatarGender: "female" },
    { name: "Derek Stone", email: email(21), role: "member", avatarGender: "male" },
  ],
  posts: [
    {
      authorIndex: 1, // Lisa Park
      content:
        "Throwback to graduation day! 🎓 Can't believe it's been 5 years! Where does the time go?",
      daysAgo: 1,
      likerIndices: [0, 2, 3, 4, 5, 6],
      comments: [
        { authorIndex: 0, content: "Best day ever! I still have my cap somewhere 😂", daysAgo: 1 },
        { authorIndex: 2, content: "We looked so young!", daysAgo: 1 },
        { authorIndex: 3, content: "The good old days! ❤️", daysAgo: 1 },
        { authorIndex: 4, content: "I still remember the after party 🎉", daysAgo: 1 },
        { authorIndex: 5, content: "Time flies! Miss you all!", daysAgo: 1 },
        { authorIndex: 6, content: "Iconic moment!", daysAgo: 1 },
      ],
    },
    {
      authorIndex: 0, // Emma Davis
      content:
        "Who's ready for the reunion trip? Lake Tahoe here we come! ⛷️ Dates: March 15-18",
      daysAgo: 4,
      likerIndices: [1, 2, 3, 4, 5, 6],
      comments: [
        { authorIndex: 1, content: "SO READY! 🙌", daysAgo: 4 },
        { authorIndex: 4, content: "I've been waiting for this all year!", daysAgo: 4 },
        { authorIndex: 5, content: "Booking my flight tonight!", daysAgo: 4 },
        { authorIndex: 6, content: "Let's gooo!", daysAgo: 4 },
      ],
    },
    {
      authorIndex: 2, // Chris Taylor
      content: "Found our old dorm photos - we looked so young! 😂 Should I post them all?",
      daysAgo: 2,
      likerIndices: [0, 1, 3, 4, 5, 6],
      comments: [
        { authorIndex: 0, content: "Yes please! But not the one from Halloween 2016 🙈", daysAgo: 2 },
        { authorIndex: 1, content: "DO IT! 📸", daysAgo: 2 },
        { authorIndex: 3, content: "Oh no, I'm scared 😅", daysAgo: 2 },
        { authorIndex: 5, content: "Please include the one from the road trip!", daysAgo: 2 },
        { authorIndex: 6, content: "Throwback time! 🔥", daysAgo: 2 },
      ],
    },
    {
      authorIndex: 4, // Josh Miller
      content:
        "Anyone watching the game tonight? Virtual watch party? Bears vs Cardinals at 7pm!",
      daysAgo: 0,
      likerIndices: [2, 3, 5, 6],
      comments: [
        { authorIndex: 2, content: "I'm in! Go Bears! 🐻", daysAgo: 0 },
        { authorIndex: 6, content: "Sending the Zoom link now!", daysAgo: 0 },
        { authorIndex: 3, content: "Perfect Friday night plan!", daysAgo: 0 },
        { authorIndex: 0, content: "Count me in!", daysAgo: 0 },
      ],
    },
    {
      authorIndex: 3, // Megan White
      content:
        "Just ran into Professor Williams at the coffee shop - she still remembers us! Asked about the thesis project 😂",
      daysAgo: 6,
      likerIndices: [0, 1, 2, 4, 5, 6],
      comments: [
        { authorIndex: 0, content: "No way! She was the best!", daysAgo: 6 },
        { authorIndex: 1, content: "I hope you said hi for all of us!", daysAgo: 6 },
        { authorIndex: 4, content: "The thesis project that almost broke us 😅", daysAgo: 6 },
      ],
    },
    {
      authorIndex: 6, // Derek Stone
      content:
        "Trivia night at O'Malley's next Friday - defending champs! 🏆 Who's on the team this time?",
      daysAgo: 3,
      likerIndices: [0, 1, 2, 3, 4, 5],
      comments: [
        { authorIndex: 0, content: "We need our secret weapon - Josh and sports questions!", daysAgo: 3 },
        { authorIndex: 4, content: "I got us covered! 💪", daysAgo: 3 },
        { authorIndex: 1, content: "I'll handle pop culture!", daysAgo: 3 },
        { authorIndex: 2, content: "Science and history here!", daysAgo: 3 },
        { authorIndex: 3, content: "Let's defend our title!", daysAgo: 3 },
      ],
    },
    {
      authorIndex: 5, // Nicole Brown
      content:
        "Spring break memories just popped up on my feed 🌴 Cancun 2018 was legendary!",
      daysAgo: 8,
      likerIndices: [0, 1, 2, 3, 4, 6],
      comments: [
        { authorIndex: 0, content: "Best trip ever!", daysAgo: 8 },
        { authorIndex: 2, content: "We need to do this again! Who's in for a beach trip?", daysAgo: 8 },
        { authorIndex: 4, content: "I still have that ridiculous sunburn photo 😂", daysAgo: 8 },
        { authorIndex: 1, content: "The memories! 🥹", daysAgo: 8 },
      ],
    },
    {
      authorIndex: 1, // Lisa Park
      content: "Who still has their student ID? Asking for a friend who wants discounts... 👀",
      daysAgo: 5,
      likerIndices: [2, 3, 4, 5, 6],
      comments: [
        { authorIndex: 2, content: "Guilty 🙋‍♂️ Still works at the movies!", daysAgo: 5 },
        { authorIndex: 0, content: "I lost mine years ago 😭", daysAgo: 5 },
        { authorIndex: 4, content: "Pro tip: photo doesn't expire 😏", daysAgo: 5 },
        { authorIndex: 3, content: "Mine is so worn out but still going!", daysAgo: 5 },
        { authorIndex: 6, content: "This is why I love this group 😂", daysAgo: 5 },
        { authorIndex: 5, content: "Never getting rid of mine!", daysAgo: 5 },
        { authorIndex: 1, content: "Asking for myself actually 🤫", daysAgo: 5 },
      ],
    },
  ],
  events: [
    {
      creatorIndex: 0,
      title: "Game Night",
      description:
        "Monthly game night! Bring your favorite board games and snacks. BYOB!",
      location: "Emma's Place",
      startDaysFromNow: 3,
      status: "upcoming",
      attendeeIndices: [0, 1, 2, 3, 4, 5, 6],
    },
    {
      creatorIndex: 0,
      title: "Study Group",
      description:
        "Virtual study session for those taking professional certifications. Support each other!",
      location: "Zoom",
      startDaysFromNow: 9,
      status: "upcoming",
      attendeeIndices: [0, 1, 3, 4],
    },
  ],
};

// ============================================================================
// NEIGHBORS (5 members, 6 posts)
// ============================================================================

export const neighborsData: SeedTribeData = {
  tribe: {
    name: "Neighbors",
    description:
      "Maple Street Community - connecting neighbors, sharing updates, and building community together.",
    location: "Maple Street, Portland OR",
    privacy: "private",
    category: "other",
  },
  users: [
    { name: "Marcus Brown", email: email(22), role: "owner", avatarGender: "male" },
    { name: "Helen Torres", email: email(23), role: "member", avatarGender: "female" },
    { name: "Gary Wilson", email: email(24), role: "member", avatarGender: "male" },
    { name: "Linda Chen", email: email(25), role: "member", avatarGender: "female" },
    { name: "Paul Martinez", email: email(26), role: "member", avatarGender: "male" },
  ],
  posts: [
    {
      authorIndex: 0, // Marcus Brown
      content:
        "Block party planning is underway! Drop your potluck ideas below 🍕 Let's make this one the best yet!",
      daysAgo: 2,
      likerIndices: [1, 2, 3, 4],
      comments: [
        { authorIndex: 1, content: "I'll bring my famous empanadas!", daysAgo: 2 },
        { authorIndex: 2, content: "BBQ ribs from me!", daysAgo: 2 },
        { authorIndex: 3, content: "Veggie spring rolls coming up!", daysAgo: 2 },
        { authorIndex: 4, content: "I got dessert covered - brownies!", daysAgo: 2 },
        { authorIndex: 0, content: "Amazing! This is going to be great!", daysAgo: 2 },
      ],
    },
    {
      authorIndex: 1, // Helen Torres
      content:
        "Lost cat alert! Orange tabby, answers to Mango 🐱 Last seen near Oak and 3rd. Please help!",
      daysAgo: 0,
      likerIndices: [0, 2, 3, 4],
      comments: [
        { authorIndex: 0, content: "I'll keep an eye out! Hope you find Mango soon!", daysAgo: 0 },
        { authorIndex: 2, content: "Sharing on NextDoor too!", daysAgo: 0 },
        { authorIndex: 3, content: "Posting on the community board at the coffee shop", daysAgo: 0 },
        { authorIndex: 4, content: "I think I saw an orange cat near the park yesterday!", daysAgo: 0 },
        { authorIndex: 1, content: "Thank you all so much! 🙏", daysAgo: 0 },
        { authorIndex: 2, content: "Any update Helen?", daysAgo: 0 },
        { authorIndex: 1, content: "UPDATE: Mango is home! Found near the school! 🎉", daysAgo: 0 },
        { authorIndex: 0, content: "Wonderful news! So happy! 😊", daysAgo: 0 },
      ],
    },
    {
      authorIndex: 2, // Gary Wilson
      content:
        "Yard sale this Saturday 8am-2pm! Come find some treasures! Furniture, books, kids toys, and more.",
      daysAgo: 3,
      likerIndices: [0, 1, 3, 4],
      comments: [
        { authorIndex: 1, content: "I'll stop by! Looking for a bookshelf", daysAgo: 3 },
        { authorIndex: 3, content: "What kind of kids toys? My grandson might be interested", daysAgo: 3 },
        { authorIndex: 2, content: "Legos, board games, some outdoor toys - all ages!", daysAgo: 3 },
      ],
    },
    {
      authorIndex: 3, // Linda Chen
      content:
        "New family moved in at #42 - let's give them a warm welcome! Anyone up for a welcome basket?",
      daysAgo: 5,
      likerIndices: [0, 1, 2, 4],
      comments: [
        { authorIndex: 0, content: "Great idea! I can contribute some homemade cookies", daysAgo: 5 },
        { authorIndex: 1, content: "I'll add a local restaurant guide!", daysAgo: 5 },
        { authorIndex: 2, content: "Plant from my garden coming up!", daysAgo: 5 },
        { authorIndex: 4, content: "I'll get a welcome card for everyone to sign", daysAgo: 5 },
      ],
    },
    {
      authorIndex: 4, // Paul Martinez
      content:
        "Anyone else's power out? Checking if it's just my house or the whole block...",
      daysAgo: 1,
      likerIndices: [1, 2, 3],
      comments: [
        { authorIndex: 1, content: "Mine's out too! Whole street I think", daysAgo: 1 },
        { authorIndex: 2, content: "Same here. Called the power company", daysAgo: 1 },
        { authorIndex: 0, content: "They said 2 hours for repair. Tree fell on a line", daysAgo: 1 },
        { authorIndex: 3, content: "Thanks for the update Marcus!", daysAgo: 1 },
        { authorIndex: 4, content: "Good to know. Guess I'm reading by candlelight tonight!", daysAgo: 1 },
        { authorIndex: 1, content: "Power's back! That was fast", daysAgo: 1 },
      ],
    },
    {
      authorIndex: 0, // Marcus Brown
      content:
        "Community garden plot sign-ups start next week 🌻 Limited spots available - first come first served!",
      daysAgo: 7,
      likerIndices: [1, 2, 3, 4],
      comments: [
        { authorIndex: 1, content: "Finally! Putting my name down for sure", daysAgo: 7 },
        { authorIndex: 3, content: "How many plots are available this year?", daysAgo: 7 },
        { authorIndex: 0, content: "We have 12 plots! Sign up at the community center", daysAgo: 7 },
        { authorIndex: 2, content: "Can't wait to grow some tomatoes!", daysAgo: 7 },
      ],
    },
  ],
  events: [
    {
      creatorIndex: 0,
      title: "Block Party",
      description:
        "Annual block party! Bring food to share, lawn chairs, and good vibes. Activities for kids included.",
      location: "Maple Street (blocked off)",
      startDaysFromNow: 5,
      status: "upcoming",
      attendeeIndices: [0, 1, 2, 3, 4],
    },
  ],
};

// ============================================================================
// EXPORTS
// ============================================================================

export const HOME_DASHBOARD_DATA: SeedTribeData[] = [
  familySquadData,
  workCrewData,
  collegeFriendsData,
  neighborsData,
];

/**
 * Cross-tribe memberships to add after initial seeding
 * Sarah Chen (home1) should also be a member of College Friends
 */
export const CROSS_TRIBE_MEMBERS = [
  {
    userEmail: email(1), // Sarah Chen
    tribeName: "College Friends",
    role: "member" as const,
  },
];
