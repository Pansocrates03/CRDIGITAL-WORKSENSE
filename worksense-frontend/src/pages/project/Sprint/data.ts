export const initialBoardData_v2 = [
  // --- Column: November --- (Example based on new image)
  {
    id: "col-nov",
    title: "November",
    tasks: [
      {
        id: "task-nov-1",
        title: "New user templates",
        // headerColors: ['#34D399'], // Example: A single teal color bar
        status: "Started", // Changed from statusTag
        priority: "P2", // New priority format
        // No assignee, date, or meta icons shown in this specific example card
        assignees: [],
        startDate: null,
        endDate: null,
        commentsCount: 0,
        linksCount: 0,
        subtasksTotal: 0,
        subtasksCompleted: 0,
        coverImageUrl: null,
      },
      {
        id: "task-nov-2",
        title: "Mobile app",
        // headerColors: ['#F87171'], // Example: A single red color bar
        status: "Started",
        priority: "P1",
        assignees: [],
        startDate: null, // Assume no date if not shown
        endDate: null,
        coverImageUrl:
          "https://lh7-us.googleusercontent.com/yavMiP4izVcevkxnVu4HpiJmKPI-D_alOEOGTAxrlJzOZ14uDUGLpS38cGclm9kgX_XY7_UD8uwgDw1rSUnbxsgB1ErwngFvLlH5xgB5p4GhoGDoCeG5Z95UfEI-X9KsSQ0aDGOnuZ8Qo30ZW0xUYvk", // Add cover image path
      },
      {
        id: "task-nov-3",
        title: "New pricing",
        // headerColors: ['#F87171'], // Example: A single red color bar
        status: "Started",
        priority: "P1",
        assignees: [],
        startDate: null,
        endDate: null,
      },
    ],
  },
  // --- Column: December ---
  {
    id: "col-dec",
    title: "December",
    tasks: [
      {
        id: "task-dec-1",
        title: "Back-end speed enhancements",
        // headerColors: [], // No bars shown
        status: "Started",
        priority: null, // No priority tag shown
        assignees: [
          {
            id: "user-5",
            name: "Dev User",
            avatarUrl:
              "https://gravatar.com/avatar/03bb86e107f4b4a868b8d108565f4647?s=400&d=robohash&r=x",
          },
        ],
        startDate: "2023-12-02", // Use ISO format
        endDate: "2023-12-07",
        commentsCount: 2,
        linksCount: 0, // Assuming the document icon represents links/attachments
        subtasksTotal: 3, // Assuming the checklist icon represents subtasks
        subtasksCompleted: 1, // Example completion
      },
      {
        id: "task-dec-2",
        title: "Custom reporting",
        headerColors: ["#6EE7B7", "#A78BFA"], // Example: Teal and Purple bars
        status: "Not started",
        priority: null,
        assignees: [
          {
            id: "user-6",
            name: "Analyst User",
            avatarUrl:
              "https://gravatar.com/avatar/03bb86e107f4b4a868b8d108565f4647?s=400&d=robohash&r=x",
          },
        ],
        startDate: "2023-12-12",
        endDate: "2023-12-14",
        commentsCount: 2,
        linksCount: 0,
        subtasksTotal: 4, // Example total
        subtasksCompleted: 0,
      },
      {
        id: "task-dec-3",
        title: "Offline mode",
        headerColors: ["#FB923C", "#EC4899"], // Example: Orange and Pink bars
        status: "Started",
        priority: null,
        assignees: [
          {
            id: "user-6",
            name: "Analyst User",
            avatarUrl:
              "https://gravatar.com/avatar/03bb86e107f4b4a868b8d108565f4647?s=400&d=robohash&r=x",
          },
        ],
        startDate: "2023-12-03",
        endDate: "2023-12-18",
        commentsCount: 0,
        linksCount: 6, // Just the document icon shown
        subtasksTotal: 0,
      },
      {
        id: "task-dec-4",
        title: "User community launch",
        // headerColors: [],
        status: "Not started",
        priority: null,
        assignees: [
          {
            id: "user-6",
            name: "Analyst User",
            avatarUrl:
              "https://gravatar.com/avatar/03bb86e107f4b4a868b8d108565f4647?s=400&d=robohash&r=x",
          },
        ],
        startDate: "2023-12-20",
        endDate: null,
        commentsCount: 0,
        linksCount: 6,
        subtasksTotal: 0,
      },
    ],
  },
  // --- Column: January ---
  {
    id: "col-jan",
    title: "January",
    tasks: [
      {
        id: "task-jan-1",
        title: "Upgrade payment options",
        headerColors: ["#6EE7B7", "#F472B6"], // Example: Teal and Pink
        status: "Not started",
        priority: "P1",
        assignees: [
          {
            id: "user-7",
            name: "Finance User",
            avatarUrl: "/avatars/avatar-7.png",
          },
        ],
        startDate: "2024-01-04",
        endDate: null,
        commentsCount: 2,
        linksCount: 7,
        subtasksTotal: 0, // Assuming play icon isn't subtasks here? Or maybe it is? Let's assume 0 for now.
        // Add a field if the play icon means something specific like 'videos'
      },
      {
        id: "task-jan-2",
        title: "In-product education",
        // headerColors: [],
        status: "Not started",
        priority: "P2",
        assignees: [
          {
            id: "user-8",
            name: "Support User",
            avatarUrl:
              "https://gravatar.com/avatar/03bb86e107f4b4a868b8d108565f4647?s=400&d=robohash&r=x",
          },
        ],
        startDate: "2024-01-06",
        endDate: "2024-01-14",
        commentsCount: 3,
        linksCount: 5,
        subtasksTotal: 0,
      },
      {
        id: "task-jan-3",
        title: "App design refresh",
        headerColors: ["#A78BFA", "#38BDF8"], // Example: Purple and Sky Blue
        status: "Not started",
        priority: "P3",
        assignees: [
          {
            id: "user-5",
            name: "Dev User",
            avatarUrl:
              "https://gravatar.com/avatar/03bb86e107f4b4a868b8d108565f4647?s=400&d=robohash&r=x",
          },
        ],
        startDate: "2024-01-08",
        endDate: "2024-01-20",
        commentsCount: 4,
        linksCount: 2,
        subtasksTotal: 0, // Assuming play icon isn't subtasks
      },
      // Add placeholder for the card with graphic at the bottom
      {
        id: "task-jan-4",
        title: null, // No title card
        coverImageUrl:
          "https://www.figma.com/community/resource/b6681f1b-d56e-4d49-8a5e-40b268ad7e7d/thumbnail", // Add cover image path
        isPlaceholder: true, // Add a flag for special styling/handling
      },
    ],
  },
  // --- Column: Done ---
  {
    id: "col-done",
    title: "Done",
    tasks: [
      {
        id: "task-done-1",
        title: "Mobile notifications",
        headerColors: ["#6EE7B7", "#A78BFA"],
        status: "Started", // Status still 'Started' in 'Done' column? Okay.
        priority: "P2",
        assignees: [],
        startDate: null,
        endDate: null,
      },
      {
        id: "task-done-2",
        title: "Localization",
        headerColors: ["#6EE7B7", "#A78BFA"],
        status: "Started",
        priority: "P3",
        assignees: [],
        startDate: null,
        endDate: null,
      },
      {
        id: "task-done-3",
        title: "New product line",
        headerColors: ["#6EE7B7", "#A78BFA"],
        status: "Started",
        priority: "P1",
        assignees: [],
        startDate: null,
        endDate: null,
      },
      {
        id: "task-done-4",
        title: "Accessibility updates", // Note: Typo fixed from image 'Acccessibility'
        headerColors: ["#6EE7B7", "#A78BFA"],
        status: "Started",
        priority: "P2",
        assignees: [],
        startDate: null,
        endDate: null,
      },
    ],
  },
  // Add other columns if needed
];

// Make sure you have placeholder images in public/images/ and public/avatars/
// e.g., public/images/mobile-app-cover.png
// e.g., public/avatars/avatar-5.png
