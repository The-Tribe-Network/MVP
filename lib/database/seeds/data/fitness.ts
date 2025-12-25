/**
 * Gyms & Fitness Studios Seed Data
 *
 * CrossFit gym community with 8 members.
 */

import type { SeedTribeData } from "../types";

export const fitnessData: SeedTribeData = {
  tribe: {
    name: "CrossFit Iron Tribe",
    description:
      "Official community for CrossFit Iron Tribe members. Share your PRs, find workout partners, and stay connected with the box family. Stronger together!",
    location: "CrossFit Iron Tribe, 2847 Industrial Blvd",
    privacy: "private",
    category: "hobbies",
  },
  users: [
    // Owner (Head Coach)
    {
      name: "Mike Reynolds",
      email: "fitness1@tribe-seed.test",
      role: "owner",
      avatarGender: "male",
    },
    // Admin (Coach)
    {
      name: "Sarah Chen",
      email: "fitness2@tribe-seed.test",
      role: "admin",
      avatarGender: "female",
    },
    // Moderator (Senior Member)
    {
      name: "James Walker",
      email: "fitness3@tribe-seed.test",
      role: "moderator",
      avatarGender: "male",
    },
    // Members
    {
      name: "Emily Brooks",
      email: "fitness4@tribe-seed.test",
      role: "member",
      avatarGender: "female",
    },
    {
      name: "David Kim",
      email: "fitness5@tribe-seed.test",
      role: "member",
      avatarGender: "male",
    },
    {
      name: "Lisa Martinez",
      email: "fitness6@tribe-seed.test",
      role: "member",
      avatarGender: "female",
    },
    {
      name: "Chris O'Brien",
      email: "fitness7@tribe-seed.test",
      role: "member",
      avatarGender: "male",
    },
    {
      name: "Amanda Foster",
      email: "fitness8@tribe-seed.test",
      role: "member",
      avatarGender: "female",
    },
  ],
  posts: [
    {
      authorIndex: 0,
      content:
        "New programming cycle starts Monday! We're focusing on Olympic lifting for the next 6 weeks. Get ready to work on those cleans and snatches. Trust the process!",
      daysAgo: 10,
      comments: [
        {
          authorIndex: 2,
          content: "Finally! My clean needs serious work. Let's go!",
          daysAgo: 10,
        },
        {
          authorIndex: 4,
          content: "Can't wait. Been wanting to hit that 225 clean for months.",
          daysAgo: 9,
        },
      ],
    },
    {
      authorIndex: 1,
      content:
        "Shoutout to everyone who crushed 'Murph' on Memorial Day! Special recognition to Emily who did it Rx for the first time. The community support was incredible.",
      daysAgo: 8,
      comments: [
        {
          authorIndex: 3,
          content: "That was brutal but so worth it. Thanks everyone for pushing me through!",
          daysAgo: 8,
        },
        {
          authorIndex: 0,
          content: "Proud of the whole crew. That's what Iron Tribe is all about!",
          daysAgo: 8,
        },
      ],
    },
    {
      authorIndex: 3,
      content:
        "PR ALERT! Just hit 185 on my back squat! 6 months ago I could barely do 95. Proof that consistency pays off. Thanks Coach Sarah for the form tips!",
      daysAgo: 6,
      comments: [
        {
          authorIndex: 1,
          content: "Emily! That's amazing progress! Your dedication is inspiring.",
          daysAgo: 6,
        },
        {
          authorIndex: 5,
          content: "Get it girl! 200 is next!",
          daysAgo: 6,
        },
        {
          authorIndex: 6,
          content: "Beast mode activated!",
          daysAgo: 5,
        },
      ],
    },
    {
      authorIndex: 2,
      content:
        "Anyone want to do an extra session Saturday morning? Thinking open gym at 8am to work on gymnastics skills. Pull-ups, muscle-ups, handstand walks.",
      daysAgo: 5,
      comments: [
        {
          authorIndex: 4,
          content: "I'm down! Need help with my kipping pull-ups.",
          daysAgo: 5,
        },
        {
          authorIndex: 7,
          content: "Count me in! Working towards my first muscle-up.",
          daysAgo: 4,
        },
      ],
    },
    {
      authorIndex: 4,
      content:
        "Quick question for the nutrition crew - what's everyone eating pre-WOD? I've been doing banana and peanut butter but looking for new ideas.",
      daysAgo: 4,
      comments: [
        {
          authorIndex: 1,
          content: "I swear by overnight oats with protein powder. Easy on the stomach during workouts.",
          daysAgo: 4,
        },
        {
          authorIndex: 3,
          content: "Greek yogurt with granola is my go-to!",
          daysAgo: 3,
        },
      ],
    },
    {
      authorIndex: 0,
      content:
        "Reminder: Annual CrossFit Games Watch Party is happening at the box next weekend. We'll have the big screen set up, food, and drinks. Bring the family!",
      daysAgo: 3,
    },
    {
      authorIndex: 5,
      content:
        "Just signed up for my first local competition next month! Nervous but excited. Any tips from those who've competed before?",
      daysAgo: 2,
      comments: [
        {
          authorIndex: 2,
          content: "Don't redline on the first workout! Pace yourself and trust your training.",
          daysAgo: 2,
        },
        {
          authorIndex: 0,
          content: "We'll do some competition prep in class. You've got this Lisa!",
          daysAgo: 2,
        },
      ],
    },
    {
      authorIndex: 6,
      content:
        "Recovery day suggestions? My legs are absolutely destroyed after this week's squat cycle.",
      daysAgo: 1,
      comments: [
        {
          authorIndex: 1,
          content: "Active recovery is key. Light bike or row, foam rolling, and stretch!",
          daysAgo: 1,
        },
      ],
    },
    {
      authorIndex: 1,
      content:
        "Holiday schedule update: We'll be running limited classes Dec 24-26 and Dec 31-Jan 1. Check the schedule in the app. Stay active through the holidays!",
      daysAgo: 0,
    },
    {
      authorIndex: 7,
      content:
        "Looking for someone to split a case of RX bars. They have a deal going but it's way too much for just me. DM if interested!",
      daysAgo: 0,
    },
  ],
  events: [
    {
      creatorIndex: 0,
      title: "Memorial Day Murph",
      description:
        "Annual Memorial Day Murph workout in honor of Lt. Michael Murphy.\n\n1 mile run\n100 pull-ups\n200 push-ups\n300 squats\n1 mile run\n\nScale as needed. Everyone welcome. Bring friends and family to cheer!",
      location: "CrossFit Iron Tribe",
      startDaysFromNow: -45,
      status: "completed",
      attendeeIndices: [0, 1, 2, 3, 4, 5, 6, 7],
    },
    {
      creatorIndex: 1,
      title: "Olympic Lifting Clinic",
      description:
        "2-hour deep dive into clean and snatch technique. Perfect for beginners or those looking to refine their lifts. Limited to 12 athletes.",
      location: "CrossFit Iron Tribe",
      startDaysFromNow: -20,
      status: "completed",
      attendeeIndices: [0, 1, 2, 4, 5],
    },
    {
      creatorIndex: 2,
      title: "Saturday Open Gym - Gymnastics Focus",
      description:
        "Extra skill session focusing on gymnastics movements. Pull-ups, muscle-ups, handstand walks, and more. All levels welcome!",
      location: "CrossFit Iron Tribe",
      startDaysFromNow: 2,
      status: "upcoming",
      attendeeIndices: [2, 4, 7],
    },
    {
      creatorIndex: 0,
      title: "CrossFit Games Watch Party",
      description:
        "Join us at the box to watch the CrossFit Games! Big screen, food, drinks, and great company. Bring the whole family!",
      location: "CrossFit Iron Tribe",
      startDaysFromNow: 10,
      status: "upcoming",
      attendeeIndices: [0, 1, 2, 3, 4],
    },
    {
      creatorIndex: 0,
      title: "New Year New You - January Challenge",
      description:
        "Kick off the new year with our 30-day fitness challenge! Daily workouts, nutrition guidance, and prizes. Sign up now!",
      location: "CrossFit Iron Tribe",
      startDaysFromNow: 35,
      status: "upcoming",
      attendeeIndices: [0, 1],
    },
  ],
};
