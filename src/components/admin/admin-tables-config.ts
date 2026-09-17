export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "image"
  | "select"
  | "date"
  | "tags";

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  categoryHint?: string;
}

export interface TableConfig {
  key: string;
  title: string;
  group: "Portfolio" | "Company" | "Content" | "Operations";
  searchFields: string[];
  fields: FieldConfig[];
}

export const ADMIN_GROUPS = [
  "Portfolio",
  "Company",
  "Content",
  "Operations",
] as const;

export const ADMIN_TABLES: Record<string, TableConfig> = {
  // ── 1. Portfolio & Offerings
  projects: {
    key: "projects",
    title: "Projects",
    group: "Portfolio",
    searchFields: ["title", "slug", "city", "sector_slug", "client"],
    fields: [
      { key: "title", label: "Project Title", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      {
        key: "sector_slug",
        label: "Sector",
        type: "select",
        options: ["residential", "commercial", "renovation", "real-estate", "infrastructure", "industrial", "healthcare", "education"],
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["newly_launched", "ongoing", "completed", "handed_over"],
        required: true,
      },
      { key: "city", label: "City", type: "text" },
      { key: "location", label: "Location / Area", type: "text" },
      { key: "client", label: "Client", type: "text" },
      { key: "architect", label: "Architect", type: "text" },
      { key: "value_pkr_millions", label: "Value (PKR Millions)", type: "number" },
      { key: "progress_percent", label: "Progress (%)", type: "number" },
      { key: "covered_area", label: "Covered Area", type: "text" },
      { key: "plot_area", label: "Plot Area", type: "text" },
      { key: "storeys", label: "Storeys", type: "text" },
      { key: "start_date", label: "Start Date", type: "date" },
      { key: "completion_date", label: "Completion Date", type: "date" },
      { key: "cover_image_url", label: "Cover Image", type: "image", categoryHint: "commercial" },
      { key: "summary", label: "Summary", type: "textarea" },
      { key: "description", label: "Full Description", type: "textarea" },
      { key: "is_featured", label: "Featured on Homepage", type: "boolean" },
      { key: "is_published", label: "Published", type: "boolean" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },

  sectors: {
    key: "sectors",
    title: "Sectors",
    group: "Portfolio",
    searchFields: ["title", "slug"],
    fields: [
      { key: "title", label: "Sector Title", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "hero_image_url", label: "Hero Image", type: "image", categoryHint: "commercial" },
      { key: "icon", label: "Icon Name", type: "text" },
      { key: "summary", label: "Summary", type: "textarea" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "is_published", label: "Published", type: "boolean" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },

  services: {
    key: "services",
    title: "Services",
    group: "Portfolio",
    searchFields: ["title", "slug", "short_title"],
    fields: [
      { key: "title", label: "Service Title", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "short_title", label: "Short Title", type: "text" },
      { key: "hero_image_url", label: "Hero Image", type: "image", categoryHint: "commercial" },
      { key: "icon", label: "Icon", type: "text" },
      { key: "summary", label: "Summary", type: "textarea" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "is_published", label: "Published", type: "boolean" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },

  developments: {
    key: "developments",
    title: "Developments",
    group: "Portfolio",
    searchFields: ["title", "slug", "city", "location"],
    fields: [
      { key: "title", label: "Development Title", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["newly_launched", "ongoing", "completed", "handed_over"],
      },
      { key: "city", label: "City", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "starting_price", label: "Starting Price", type: "text" },
      { key: "storeys", label: "Storeys", type: "text" },
      { key: "handover", label: "Handover Date", type: "text" },
      { key: "cover_image_url", label: "Cover Image", type: "image", categoryHint: "real-estate" },
      { key: "brochure_url", label: "Brochure URL", type: "text" },
      { key: "summary", label: "Summary", type: "textarea" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "is_featured", label: "Featured", type: "boolean" },
      { key: "is_published", label: "Published", type: "boolean" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },

  // ── 2. Company & Credentials
  team_members: {
    key: "team_members",
    title: "Team Members",
    group: "Company",
    searchFields: ["name", "role", "email"],
    fields: [
      { key: "name", label: "Full Name", type: "text", required: true },
      { key: "role", label: "Role / Designation", type: "text" },
      { key: "credentials", label: "Credentials (PE, BSc)", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "linkedin_url", label: "LinkedIn URL", type: "text" },
      { key: "photo_url", label: "Photo", type: "image", categoryHint: "careers" },
      { key: "bio", label: "Bio / Summary", type: "textarea" },
      { key: "is_published", label: "Published", type: "boolean" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },

  testimonials: {
    key: "testimonials",
    title: "Testimonials",
    group: "Company",
    searchFields: ["author", "company", "quote"],
    fields: [
      { key: "author", label: "Client Name", type: "text", required: true },
      { key: "author_role", label: "Client Role", type: "text" },
      { key: "company", label: "Company / Organization", type: "text" },
      { key: "quote", label: "Testimonial Quote", type: "textarea", required: true },
      { key: "rating", label: "Rating (1-5)", type: "number" },
      { key: "avatar_url", label: "Avatar / Photo", type: "image", categoryHint: "careers" },
      { key: "is_published", label: "Published", type: "boolean" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },

  clients: {
    key: "clients",
    title: "Clients",
    group: "Company",
    searchFields: ["name", "website_url"],
    fields: [
      { key: "name", label: "Client Name", type: "text", required: true },
      { key: "logo_url", label: "Logo", type: "image", categoryHint: "about" },
      { key: "website_url", label: "Website URL", type: "text" },
      { key: "is_published", label: "Published", type: "boolean" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },

  certifications: {
    key: "certifications",
    title: "Certifications",
    group: "Company",
    searchFields: ["title", "issuer", "reference_no"],
    fields: [
      { key: "title", label: "Certificate Title", type: "text", required: true },
      { key: "issuer", label: "Issuing Authority (e.g. PEC, ISO)", type: "text" },
      { key: "issued_year", label: "Issued Year", type: "number" },
      { key: "reference_no", label: "Registration / License No", type: "text" },
      { key: "image_url", label: "Badge / Certificate Image", type: "image", categoryHint: "about" },
      { key: "document_url", label: "Document URL", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "is_published", label: "Published", type: "boolean" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },

  awards: {
    key: "awards",
    title: "Awards",
    group: "Company",
    searchFields: ["title", "issuer", "year"],
    fields: [
      { key: "title", label: "Award Title", type: "text", required: true },
      { key: "issuer", label: "Conferred By", type: "text" },
      { key: "year", label: "Year", type: "number" },
      { key: "image_url", label: "Award Image", type: "image", categoryHint: "about" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "is_published", label: "Published", type: "boolean" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },

  milestones: {
    key: "milestones",
    title: "Milestones",
    group: "Company",
    searchFields: ["title", "year"],
    fields: [
      { key: "year", label: "Year", type: "text", required: true },
      { key: "title", label: "Milestone Title", type: "text", required: true },
      { key: "image_url", label: "Photo / Icon", type: "image", categoryHint: "about" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "is_published", label: "Published", type: "boolean" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },

  // ── 3. Content & Media
  posts: {
    key: "posts",
    title: "Insights & Posts",
    group: "Content",
    searchFields: ["title", "slug", "category", "author"],
    fields: [
      { key: "title", label: "Article Title", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "category", label: "Category", type: "text" },
      { key: "author", label: "Author", type: "text" },
      { key: "read_minutes", label: "Read Time (minutes)", type: "number" },
      { key: "cover_image_url", label: "Cover Image", type: "image", categoryHint: "commercial" },
      { key: "published_at", label: "Publish Date", type: "date" },
      { key: "excerpt", label: "Excerpt", type: "textarea" },
      { key: "body", label: "Full Content", type: "textarea" },
      { key: "is_published", label: "Published", type: "boolean" },
    ],
  },

  home_sections: {
    key: "home_sections",
    title: "Home Sections",
    group: "Content",
    searchFields: ["key", "label", "heading"],
    fields: [
      { key: "key", label: "Section Key", type: "text", required: true },
      { key: "label", label: "Label / Title", type: "text", required: true },
      { key: "eyebrow", label: "Eyebrow Text", type: "text" },
      { key: "heading", label: "Main Heading", type: "text" },
      { key: "subheading", label: "Subheading", type: "text" },
      { key: "body", label: "Body Text", type: "textarea" },
      { key: "cta_label", label: "CTA Button Text", type: "text" },
      { key: "cta_href", label: "CTA Button Link", type: "text" },
      { key: "media_url", label: "Desktop Media URL", type: "image", categoryHint: "hero" },
      { key: "poster_url", label: "Mobile / Poster URL", type: "image", categoryHint: "hero" },
      { key: "is_visible", label: "Visible on Site", type: "boolean" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },

  media: {
    key: "media",
    title: "Media Library",
    group: "Content",
    searchFields: ["name", "folder", "url", "alt_text"],
    fields: [
      { key: "name", label: "File Name", type: "text", required: true },
      { key: "folder", label: "Category Folder", type: "text" },
      { key: "url", label: "File URL", type: "image", categoryHint: "commercial", required: true },
      { key: "alt_text", label: "Alt Text", type: "text" },
      { key: "mime_type", label: "MIME Type", type: "text" },
      { key: "size_bytes", label: "Size (Bytes)", type: "number" },
    ],
  },

  downloads: {
    key: "downloads",
    title: "Downloads",
    group: "Content",
    searchFields: ["title", "category"],
    fields: [
      { key: "title", label: "Document Title", type: "text", required: true },
      { key: "category", label: "Category", type: "text" },
      { key: "file_url", label: "File Download URL", type: "text", required: true },
      { key: "thumbnail_url", label: "Thumbnail Preview", type: "image", categoryHint: "about" },
      { key: "file_size", label: "File Size (e.g. 4.2 MB)", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "is_published", label: "Published", type: "boolean" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },

  faqs: {
    key: "faqs",
    title: "FAQs",
    group: "Content",
    searchFields: ["question", "answer", "category"],
    fields: [
      { key: "question", label: "Question", type: "text", required: true },
      { key: "category", label: "Category", type: "text" },
      { key: "answer", label: "Answer", type: "textarea", required: true },
      { key: "is_published", label: "Published", type: "boolean" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },

  page_seo: {
    key: "page_seo",
    title: "Page SEO",
    group: "Content",
    searchFields: ["path", "title", "description"],
    fields: [
      { key: "path", label: "Page Path (e.g. /about)", type: "text", required: true },
      { key: "title", label: "Meta Title", type: "text" },
      { key: "description", label: "Meta Description", type: "textarea" },
      { key: "og_image_url", label: "OG Image Preview", type: "image", categoryHint: "commercial" },
      { key: "noindex", label: "Disallow Indexing (NoIndex)", type: "boolean" },
    ],
  },

  // ── 4. Inquiries & Operations
  leads: {
    key: "leads",
    title: "Leads & Enquiries",
    group: "Operations",
    searchFields: ["name", "email", "phone", "city", "service_interest"],
    fields: [
      { key: "name", label: "Full Name", type: "text", required: true },
      { key: "email", label: "Email", type: "text" },
      { key: "phone", label: "Phone / WhatsApp", type: "text" },
      { key: "company", label: "Company", type: "text" },
      { key: "city", label: "Project City", type: "text" },
      { key: "service_interest", label: "Service Interest", type: "text" },
      { key: "project_type", label: "Project Type", type: "text" },
      { key: "budget", label: "Budget Band", type: "text" },
      { key: "status", label: "Lead Status", type: "select", options: ["new", "contacted", "qualified", "closed"] },
      { key: "source", label: "Source", type: "text" },
      { key: "message", label: "Client Message", type: "textarea" },
      { key: "notes", label: "Internal Staff Notes", type: "textarea" },
    ],
  },

  jobs: {
    key: "jobs",
    title: "Careers & Vacancies",
    group: "Operations",
    searchFields: ["title", "department", "location"],
    fields: [
      { key: "title", label: "Job Title", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "department", label: "Department", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "employment_type", label: "Employment Type", type: "select", options: ["Full-time", "Contract", "Site-based", "Part-time"] },
      { key: "experience", label: "Required Experience", type: "text" },
      { key: "closes_at", label: "Closing Date", type: "date" },
      { key: "summary", label: "Short Summary", type: "textarea" },
      { key: "description", label: "Full Role Description", type: "textarea" },
      { key: "is_published", label: "Published", type: "boolean" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },

  applications: {
    key: "applications",
    title: "Job Applications",
    group: "Operations",
    searchFields: ["name", "email", "job_title", "phone"],
    fields: [
      { key: "name", label: "Applicant Name", type: "text", required: true },
      { key: "email", label: "Email", type: "text", required: true },
      { key: "phone", label: "Phone", type: "text" },
      { key: "job_title", label: "Applied Position", type: "text" },
      { key: "cv_url", label: "Resume / CV Link", type: "text" },
      { key: "cover_letter", label: "Cover Note", type: "textarea" },
      { key: "status", label: "Application Status", type: "select", options: ["pending", "reviewed", "interview", "rejected", "hired"] },
    ],
  },

  tenders: {
    key: "tenders",
    title: "Procurement Tenders",
    group: "Operations",
    searchFields: ["title", "reference_no", "category"],
    fields: [
      { key: "title", label: "Tender Title", type: "text", required: true },
      { key: "reference_no", label: "Tender Ref No", type: "text" },
      { key: "category", label: "Procurement Category", type: "text" },
      { key: "published_on", label: "Published On", type: "date" },
      { key: "closes_at", label: "Closing Date", type: "date" },
      { key: "document_url", label: "Tender Document Link", type: "text" },
      { key: "description", label: "Scope & Specifications", type: "textarea" },
      { key: "is_published", label: "Published", type: "boolean" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },

  vendors: {
    key: "vendors",
    title: "Vendor Registrations",
    group: "Operations",
    searchFields: ["company_name", "contact_person", "email", "category"],
    fields: [
      { key: "company_name", label: "Vendor Company", type: "text", required: true },
      { key: "contact_person", label: "Contact Person", type: "text" },
      { key: "email", label: "Email", type: "text", required: true },
      { key: "phone", label: "Phone", type: "text" },
      { key: "category", label: "Trade / Category", type: "text" },
      { key: "ntn", label: "NTN Number", type: "text" },
      { key: "city", label: "City", type: "text" },
      { key: "website", label: "Website", type: "text" },
      { key: "document_url", label: "Company Profile URL", type: "text" },
      { key: "status", label: "Registration Status", type: "select", options: ["pending", "approved", "rejected"] },
      { key: "message", label: "Capabilities Summary", type: "textarea" },
    ],
  },
};
