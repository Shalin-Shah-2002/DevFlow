export type NavItem = {
  label: string;
  href: string;
};

export type FeatureItem = {
  title: string;
  description: string;
  icon: string;
};

export type StepItem = {
  number: string;
  title: string;
  description: string;
};

export type StatItem = {
  value: string;
  label: string;
};

export type FooterColumn = {
  title: string;
  links: string[];
};

export type LandingPageData = {
  nav: {
    logoText: string;
    logoIcon: string;
    items: NavItem[];
    signInText: string;
    ctaText: string;
  };
  hero: {
    eyebrow: string;
    heading: string[];
    subheading: string[];
    primaryCta: string;
    secondaryCta: string;
    socialProof: string;
    avatars: string[];
    extraCount: string;
    previewImage: string;
  };
  features: {
    heading: string;
    subheading: string[];
    items: FeatureItem[];
  };
  steps: {
    heading: string;
    subheading: string;
    items: StepItem[];
  };
  stats: StatItem[];
  cta: {
    heading: string;
    subheading: string[];
    primary: string;
    secondary: string;
  };
  footer: {
    logoText: string;
    logoIcon: string;
    description: string[];
    columns: FooterColumn[];
    legalText: string;
    socialIcons: string[];
  };
};

export const landingPageData: LandingPageData = {
  nav: {
    logoText: 'DevFlow',
    logoIcon: 'https://www.figma.com/api/mcp/asset/965845bc-7eea-4975-8892-69d763d30b8f',
    items: [
      { label: 'Features', href: '#features' },
      { label: 'How it Works', href: '#how-it-works' },
      { label: 'About', href: '#about' },
      { label: 'Pricing', href: '#pricing' }
    ],
    signInText: 'Sign In',
    ctaText: 'Get Started Free'
  },
  hero: {
    eyebrow: 'GitHub Issues, Reimagined',
    heading: ['Manage Every Issue.', 'Ship Faster.'],
    subheading: [
      'The ultimate dashboard for engineering teams.',
      'Synchronize, filter, and automate your GitHub workflow',
      'without the friction.'
    ],
    primaryCta: 'Connect GitHub',
    secondaryCta: 'View Demo',
    socialProof: 'Trusted by 2,400+ developers',
    avatars: [
      'https://www.figma.com/api/mcp/asset/6e04ca85-da17-46e1-bc8c-d45e0abec992',
      'https://www.figma.com/api/mcp/asset/b606866e-00d7-4ba9-bba0-5181b0120311',
      'https://www.figma.com/api/mcp/asset/e483a6e3-779c-4477-b977-baf658a13df6'
    ],
    extraCount: '+2k',
    previewImage: '/dashboard-preview-v2.png'
  },
  features: {
    heading: 'Streamline Your Workflow',
    subheading: [
      'Everything you need to manage GitHub issues at scale without the complexity',
      'of traditional tools.'
    ],
    items: [
      {
        title: 'Smart Filtering',
        description: 'Advanced multi-repo filtering with saved queries for instant access to what matters.',
        icon: 'https://www.figma.com/api/mcp/asset/e5d49ce3-2670-4569-90ff-5acda7911c4e'
      },
      {
        title: 'Repo Overview',
        description: 'Consolidated view of all your projects in a single, beautiful management interface.',
        icon: 'https://www.figma.com/api/mcp/asset/14e7665f-828a-4ab3-b637-f1e18a3a4a1d'
      },
      {
        title: 'Analytics',
        description: 'Deep insights into cycle time, throughput, and team velocity with visual reports.',
        icon: 'https://www.figma.com/api/mcp/asset/a55c65fe-ac39-4be3-99b3-111e38febcf8'
      },
      {
        title: 'Saved Views',
        description: 'Build custom perspectives for different team members and switch between them instantly.',
        icon: 'https://www.figma.com/api/mcp/asset/659eab83-317c-4186-b4e7-e8b3e90e43ba'
      },
      {
        title: 'Label Manager',
        description: 'Standardize and sync labels across dozens of repositories with one click.',
        icon: 'https://www.figma.com/api/mcp/asset/229f0357-9447-432a-9abc-39da1054f5f'
      },
      {
        title: 'Notification Center',
        description: 'A focused inbox for your mentions, reviews, and assignments that actually works.',
        icon: 'https://www.figma.com/api/mcp/asset/677640f9-b98a-40f1-b759-4a5475d62747'
      }
    ]
  },
  steps: {
    heading: 'How It Works',
    subheading: 'Set up your command center in less than two minutes.',
    items: [
      {
        number: '1',
        title: 'Connect',
        description: 'Securely link your GitHub account and select your active repositories.'
      },
      {
        number: '2',
        title: 'Add',
        description: 'Organize your workflow with smart boards, filters, and priority tags.'
      },
      {
        number: '3',
        title: 'Track',
        description: 'Monitor progress and deploy faster with high-velocity issue tracking.'
      }
    ]
  },
  stats: [
    { value: '99.9%', label: 'Uptime' },
    { value: '24ms', label: 'Avg Latency' },
    { value: '1.2M+', label: 'Issues Synced' },
    { value: '500+', label: 'Companies' }
  ],
  cta: {
    heading: 'Turn every issue into momentum.',
    subheading: [
      'Great teams are built one solved blocker at a time.',
      'DevFlow helps you move from chaos to clarity, every single sprint.'
    ],
    primary: 'Get Started Free',
    secondary: 'Schedule Demo'
  },
  footer: {
    logoText: 'DevFlow',
    logoIcon: 'https://www.figma.com/api/mcp/asset/ab214089-47b3-4bb9-a906-87ebc591115e',
    description: ['Making software development more efficient,', 'one issue at a time.'],
    columns: [
      { title: 'Product', links: ['Features', 'Pricing', 'API Docs'] },
      { title: 'Company', links: ['About', 'Blog', 'Careers'] },
      { title: 'Legal', links: ['Privacy', 'Terms', 'Cookie Policy'] }
    ],
    legalText: '© 2024 DevFlow Inc. All rights reserved.',
    socialIcons: [
      'https://www.figma.com/api/mcp/asset/3a4ab5b8-150f-4cbe-9297-1d180f0eb502',
      'https://www.figma.com/api/mcp/asset/e591aa1e-701f-4914-becc-135448fddb37',
      'https://www.figma.com/api/mcp/asset/ef6c5d1e-0cda-4e31-9567-370e9c57c5c8'
    ]
  }
};
