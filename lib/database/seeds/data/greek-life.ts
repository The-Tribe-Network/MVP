/**
 * Greek Life Seed Data
 *
 * Fraternity/Sorority community with 18 members.
 */

import type { SeedTribeData } from "../types";

export const greekLifeData: SeedTribeData = {
  tribe: {
    name: "Alpha Sigma Phi - Delta Chapter",
    description:
      "Official chapter of Alpha Sigma Phi fraternity at State University. Brotherhood, scholarship, and service since 1965. Causa Latet Vis Est Notissima",
    location: "State University, 456 Greek Row",
    privacy: "private",
    category: "social",
  },
  users: [
    // Owner
    {
      name: "Marcus Thompson",
      email: "greek1@tribe-seed.test",
      role: "owner",
      avatarGender: "male",
    },
    // Admins
    {
      name: "Jake Williams",
      email: "greek2@tribe-seed.test",
      role: "admin",
      avatarGender: "male",
    },
    {
      name: "Chris Martinez",
      email: "greek3@tribe-seed.test",
      role: "admin",
      avatarGender: "male",
    },
    // Moderators
    {
      name: "Tyler Johnson",
      email: "greek4@tribe-seed.test",
      role: "moderator",
      avatarGender: "male",
    },
    {
      name: "Brandon Lee",
      email: "greek5@tribe-seed.test",
      role: "moderator",
      avatarGender: "male",
    },
    // Members
    {
      name: "Ryan Chen",
      email: "greek6@tribe-seed.test",
      role: "member",
      avatarGender: "male",
    },
    {
      name: "Derek Brown",
      email: "greek7@tribe-seed.test",
      role: "member",
      avatarGender: "male",
    },
    {
      name: "Austin Miller",
      email: "greek8@tribe-seed.test",
      role: "member",
      avatarGender: "male",
    },
    {
      name: "Kevin Davis",
      email: "greek9@tribe-seed.test",
      role: "member",
      avatarGender: "male",
    },
    {
      name: "Matt Wilson",
      email: "greek10@tribe-seed.test",
      role: "member",
      avatarGender: "male",
    },
    {
      name: "Josh Taylor",
      email: "greek11@tribe-seed.test",
      role: "member",
      avatarGender: "male",
    },
    {
      name: "Ethan Moore",
      email: "greek12@tribe-seed.test",
      role: "member",
      avatarGender: "male",
    },
    {
      name: "Noah Anderson",
      email: "greek13@tribe-seed.test",
      role: "member",
      avatarGender: "male",
    },
    {
      name: "Dylan Garcia",
      email: "greek14@tribe-seed.test",
      role: "member",
      avatarGender: "male",
    },
    {
      name: "Liam Robinson",
      email: "greek15@tribe-seed.test",
      role: "member",
      avatarGender: "male",
    },
    {
      name: "Mason Clark",
      email: "greek16@tribe-seed.test",
      role: "member",
      avatarGender: "male",
    },
    {
      name: "Lucas Wright",
      email: "greek17@tribe-seed.test",
      role: "member",
      avatarGender: "male",
    },
    {
      name: "Jack Hall",
      email: "greek18@tribe-seed.test",
      role: "member",
      avatarGender: "male",
    },
  ],
  posts: [
    {
      authorIndex: 0,
      content:
        "Rush Week officially starts Monday! We have an incredible lineup planned this semester. Check the events tab for the full schedule. Looking forward to meeting some great potential new members. #RushASP",
      daysAgo: 14,
      comments: [
        {
          authorIndex: 2,
          content: "Casino Night is going to be legendary this year",
          daysAgo: 14,
        },
        {
          authorIndex: 5,
          content: "Count me in for setup crew!",
          daysAgo: 13,
        },
        {
          authorIndex: 1,
          content: "Thanks for volunteering Ryan! We need more hands for decorations",
          daysAgo: 13,
        },
      ],
    },
    {
      authorIndex: 1,
      content:
        "Chapter meeting tonight at 7pm SHARP. We have important philanthropy updates and need to finalize Spring Formal details. Attendance is mandatory for all actives. See you there brothers!",
      daysAgo: 10,
      comments: [
        {
          authorIndex: 6,
          content: "Running 5 mins late - coming from study group",
          daysAgo: 10,
        },
      ],
    },
    {
      authorIndex: 3,
      content:
        "HUGE shoutout to everyone who helped at the Habitat for Humanity build yesterday! We put in over 100 collective hours. That's what brotherhood is all about. Photos coming soon",
      daysAgo: 7,
      comments: [
        {
          authorIndex: 8,
          content: "Best philanthropy event yet!",
          daysAgo: 7,
        },
        {
          authorIndex: 10,
          content: "My arms are still sore but worth it",
          daysAgo: 6,
        },
        {
          authorIndex: 0,
          content: "Proud of you all. This is what ASP stands for.",
          daysAgo: 6,
        },
      ],
    },
    {
      authorIndex: 4,
      content:
        "New member class of 2024 is officially welcomed! 12 incredible guys who are going to do amazing things. Welcome to the brotherhood gentlemen!",
      daysAgo: 5,
      comments: [
        {
          authorIndex: 12,
          content: "Honored to be part of this chapter!",
          daysAgo: 5,
        },
        {
          authorIndex: 14,
          content: "Let's get it!",
          daysAgo: 5,
        },
      ],
    },
    {
      authorIndex: 2,
      content:
        "Finals week survival kit distribution is happening Thursday at the house. Energy drinks, snacks, and study guides. We got this brothers!",
      daysAgo: 3,
    },
    {
      authorIndex: 7,
      content:
        "Anyone have notes for ECON 301? Missed Tuesday's lecture for a job interview.",
      daysAgo: 2,
      comments: [
        {
          authorIndex: 9,
          content: "I got you bro, sending them over now",
          daysAgo: 2,
        },
        {
          authorIndex: 7,
          content: "Thanks Kevin! You're the best",
          daysAgo: 2,
        },
      ],
    },
    {
      authorIndex: 0,
      content:
        "Reminder: Alumni weekend is in 3 weeks. We need volunteers for the golf tournament and Saturday dinner. Sign up sheet is on the house bulletin board.",
      daysAgo: 1,
    },
    {
      authorIndex: 5,
      content:
        "Intramural basketball team made it to the semifinals! Game is Wednesday at 8pm. Come support!",
      daysAgo: 1,
      comments: [
        {
          authorIndex: 11,
          content: "We're going all the way this year!",
          daysAgo: 1,
        },
      ],
    },
    {
      authorIndex: 1,
      content:
        "Spring Formal tickets go on sale next Monday! Early bird price is $85, goes up to $100 after the first week. Don't sleep on this - last year sold out fast.",
      daysAgo: 0,
    },
    {
      authorIndex: 3,
      content:
        "Study session at the library tonight for anyone taking organic chemistry. Room 204B starting at 6pm. Strength in numbers!",
      daysAgo: 0,
    },
  ],
  events: [
    {
      creatorIndex: 0,
      title: "Fall Rush Week 2024",
      description:
        "Join Alpha Sigma Phi for an exciting week of events! Meet the brothers and see what our chapter is all about.\n\nSchedule:\n- Monday: Welcome BBQ\n- Tuesday: Casino Night\n- Wednesday: Sports Day\n- Thursday: Philanthropy Showcase\n- Friday: Hawaiian Luau",
      location: "ASP Chapter House, 456 Greek Row",
      startDaysFromNow: -35,
      endDaysFromNow: -30,
      status: "completed",
      attendeeIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    },
    {
      creatorIndex: 3,
      title: "Habitat for Humanity Build Day",
      description:
        "Annual chapter philanthropy event. We'll be helping build homes for families in need. Lunch provided. Wear comfortable clothes and closed-toe shoes.",
      location: "Habitat for Humanity Site, 789 Oak Street",
      startDaysFromNow: -8,
      status: "completed",
      attendeeIndices: [0, 3, 5, 6, 7, 8, 10, 12, 14, 16],
    },
    {
      creatorIndex: 1,
      title: "Chapter Meeting - Finals Prep",
      description:
        "Weekly chapter meeting with special focus on finals preparation. Review of study resources, tutor signups, and quiet hours schedule.",
      location: "Chapter House, Great Room",
      startDaysFromNow: -10,
      status: "completed",
      attendeeIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    },
    {
      creatorIndex: 0,
      title: "Alumni Weekend 2025",
      description:
        "Annual alumni reunion! Golf tournament Friday, dinner Saturday, brunch Sunday. Great opportunity to network and reconnect with chapter history.",
      location: "Chapter House & Country Club",
      startDaysFromNow: 21,
      endDaysFromNow: 23,
      status: "upcoming",
      attendeeIndices: [0, 1, 2, 3, 4, 5],
    },
    {
      creatorIndex: 1,
      title: "Spring Formal 2025",
      description:
        "Annual spring formal at The Grand Ballroom downtown. Semi-formal dress code. Dinner, dancing, and brotherhood. Plus ones welcome!\n\nTickets: $85 early bird, $100 regular",
      location: "The Grand Ballroom, 100 Main Street",
      startDaysFromNow: 45,
      status: "upcoming",
      attendeeIndices: [0, 1, 2],
    },
  ],
};
