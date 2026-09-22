export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          cover_letter: string | null
          created_at: string
          cv_url: string | null
          email: string
          id: string
          job_id: string | null
          job_title: string | null
          name: string
          phone: string | null
          status: string
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string
          cv_url?: string | null
          email: string
          id?: string
          job_id?: string | null
          job_title?: string | null
          name: string
          phone?: string | null
          status?: string
        }
        Update: {
          cover_letter?: string | null
          created_at?: string
          cv_url?: string | null
          email?: string
          id?: string
          job_id?: string | null
          job_title?: string | null
          name?: string
          phone?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      awards: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_published: boolean
          issuer: string | null
          sort_order: number
          title: string
          updated_at: string
          year: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          issuer?: string | null
          sort_order?: number
          title: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          issuer?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      certifications: {
        Row: {
          created_at: string
          description: string | null
          document_url: string | null
          id: string
          image_url: string | null
          is_published: boolean
          issued_year: number | null
          issuer: string | null
          reference_no: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          document_url?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          issued_year?: number | null
          issuer?: string | null
          reference_no?: string | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          document_url?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          issued_year?: number | null
          issuer?: string | null
          reference_no?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string
          id: string
          is_published: boolean
          logo_url: string | null
          name: string
          sort_order: number
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_published?: boolean
          logo_url?: string | null
          name: string
          sort_order?: number
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_published?: boolean
          logo_url?: string | null
          name?: string
          sort_order?: number
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      developments: {
        Row: {
          amenities: Json
          brochure_url: string | null
          city: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          gallery: Json
          handover: string | null
          highlights: Json
          id: string
          is_featured: boolean
          is_published: boolean
          location: string | null
          payment_plan: Json
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          starting_price: string | null
          status: Database["public"]["Enums"]["project_status"]
          storeys: string | null
          summary: string | null
          title: string
          unit_types: Json
          updated_at: string
        }
        Insert: {
          amenities?: Json
          brochure_url?: string | null
          city?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          gallery?: Json
          handover?: string | null
          highlights?: Json
          id?: string
          is_featured?: boolean
          is_published?: boolean
          location?: string | null
          payment_plan?: Json
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          starting_price?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          storeys?: string | null
          summary?: string | null
          title: string
          unit_types?: Json
          updated_at?: string
        }
        Update: {
          amenities?: Json
          brochure_url?: string | null
          city?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          gallery?: Json
          handover?: string | null
          highlights?: Json
          id?: string
          is_featured?: boolean
          is_published?: boolean
          location?: string | null
          payment_plan?: Json
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          starting_price?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          storeys?: string | null
          summary?: string | null
          title?: string
          unit_types?: Json
          updated_at?: string
        }
        Relationships: []
      }
      downloads: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          file_size: string | null
          file_url: string | null
          id: string
          is_published: boolean
          sort_order: number
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_size?: string | null
          file_url?: string | null
          id?: string
          is_published?: boolean
          sort_order?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_size?: string | null
          file_url?: string | null
          id?: string
          is_published?: boolean
          sort_order?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          id: string
          is_published: boolean
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      home_sections: {
        Row: {
          body: string | null
          cta_href: string | null
          cta_label: string | null
          extra: Json
          eyebrow: string | null
          heading: string | null
          id: string
          is_visible: boolean
          key: string
          label: string
          media_url: string | null
          poster_url: string | null
          sort_order: number
          subheading: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          cta_href?: string | null
          cta_label?: string | null
          extra?: Json
          eyebrow?: string | null
          heading?: string | null
          id?: string
          is_visible?: boolean
          key: string
          label: string
          media_url?: string | null
          poster_url?: string | null
          sort_order?: number
          subheading?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          cta_href?: string | null
          cta_label?: string | null
          extra?: Json
          eyebrow?: string | null
          heading?: string | null
          id?: string
          is_visible?: boolean
          key?: string
          label?: string
          media_url?: string | null
          poster_url?: string | null
          sort_order?: number
          subheading?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          closes_at: string | null
          created_at: string
          department: string | null
          description: string | null
          employment_type: string | null
          experience: string | null
          id: string
          is_published: boolean
          location: string | null
          requirements: Json
          responsibilities: Json
          slug: string
          sort_order: number
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          closes_at?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          employment_type?: string | null
          experience?: string | null
          id?: string
          is_published?: boolean
          location?: string | null
          requirements?: Json
          responsibilities?: Json
          slug: string
          sort_order?: number
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          closes_at?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          employment_type?: string | null
          experience?: string | null
          id?: string
          is_published?: boolean
          location?: string | null
          requirements?: Json
          responsibilities?: Json
          slug?: string
          sort_order?: number
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          budget: string | null
          city: string | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          message: string | null
          name: string
          notes: string | null
          phone: string | null
          project_type: string | null
          service_interest: string | null
          source: string
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          budget?: string | null
          city?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          project_type?: string | null
          service_interest?: string | null
          source?: string
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          budget?: string | null
          city?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          project_type?: string | null
          service_interest?: string | null
          source?: string
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          alt_text: string | null
          created_at: string
          folder: string | null
          id: string
          mime_type: string | null
          name: string
          path: string | null
          size_bytes: number | null
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          folder?: string | null
          id?: string
          mime_type?: string | null
          name: string
          path?: string | null
          size_bytes?: number | null
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          folder?: string | null
          id?: string
          mime_type?: string | null
          name?: string
          path?: string | null
          size_bytes?: number | null
          url?: string
        }
        Relationships: []
      }
      milestones: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_published: boolean
          sort_order: number
          title: string
          updated_at: string
          year: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          sort_order?: number
          title: string
          updated_at?: string
          year: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
          year?: string
        }
        Relationships: []
      }
      page_seo: {
        Row: {
          description: string | null
          id: string
          noindex: boolean
          og_image_url: string | null
          path: string
          title: string | null
          updated_at: string
        }
        Insert: {
          description?: string | null
          id?: string
          noindex?: boolean
          og_image_url?: string | null
          path: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          description?: string | null
          id?: string
          noindex?: boolean
          og_image_url?: string | null
          path?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          author: string | null
          body: string | null
          category: string | null
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean
          published_at: string | null
          read_minutes: number | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          tags: Json
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          body?: string | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          read_minutes?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          tags?: Json
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          body?: string | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          read_minutes?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          tags?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          architect: string | null
          certifications: string | null
          city: string | null
          client: string | null
          completion_date: string | null
          cover_image_url: string | null
          covered_area: string | null
          created_at: string
          description: string | null
          gallery: Json
          id: string
          is_featured: boolean
          is_published: boolean
          location: string | null
          partners: string | null
          plot_area: string | null
          progress_percent: number | null
          scope: Json
          sector_slug: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          storeys: string | null
          summary: string | null
          title: string
          updated_at: string
          value_pkr_millions: number | null
          video_url: string | null
        }
        Insert: {
          architect?: string | null
          certifications?: string | null
          city?: string | null
          client?: string | null
          completion_date?: string | null
          cover_image_url?: string | null
          covered_area?: string | null
          created_at?: string
          description?: string | null
          gallery?: Json
          id?: string
          is_featured?: boolean
          is_published?: boolean
          location?: string | null
          partners?: string | null
          plot_area?: string | null
          progress_percent?: number | null
          scope?: Json
          sector_slug?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          storeys?: string | null
          summary?: string | null
          title: string
          updated_at?: string
          value_pkr_millions?: number | null
          video_url?: string | null
        }
        Update: {
          architect?: string | null
          certifications?: string | null
          city?: string | null
          client?: string | null
          completion_date?: string | null
          cover_image_url?: string | null
          covered_area?: string | null
          created_at?: string
          description?: string | null
          gallery?: Json
          id?: string
          is_featured?: boolean
          is_published?: boolean
          location?: string | null
          partners?: string | null
          plot_area?: string | null
          progress_percent?: number | null
          scope?: Json
          sector_slug?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          storeys?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
          value_pkr_millions?: number | null
          video_url?: string | null
        }
        Relationships: []
      }
      sectors: {
        Row: {
          created_at: string
          description: string | null
          hero_image_url: string | null
          icon: string | null
          id: string
          is_published: boolean
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          hero_image_url?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          hero_image_url?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          bullets: Json
          created_at: string
          description: string | null
          faqs: Json
          hero_image_url: string | null
          icon: string | null
          id: string
          is_published: boolean
          og_image_url: string | null
          process_steps: Json
          seo_description: string | null
          seo_title: string | null
          short_title: string | null
          slug: string
          sort_order: number
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          bullets?: Json
          created_at?: string
          description?: string | null
          faqs?: Json
          hero_image_url?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          og_image_url?: string | null
          process_steps?: Json
          seo_description?: string | null
          seo_title?: string | null
          short_title?: string | null
          slug: string
          sort_order?: number
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          bullets?: Json
          created_at?: string
          description?: string | null
          faqs?: Json
          hero_image_url?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          og_image_url?: string | null
          process_steps?: Json
          seo_description?: string | null
          seo_title?: string | null
          short_title?: string | null
          slug?: string
          sort_order?: number
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          address: string | null
          city: string | null
          company_full_name: string
          company_name: string
          country: string | null
          email: string | null
          email_alt: string | null
          facebook_url: string | null
          footer_note: string | null
          founded_year: number | null
          google_maps_url: string | null
          id: number
          instagram_url: string | null
          linkedin_url: string | null
          logo_url: string | null
          map_embed_url: string | null
          map_lat: number | null
          map_lng: number | null
          ntn_number: string | null
          offices: Json
          pec_number: string | null
          phone: string | null
          phone_alt: string | null
          tagline: string | null
          updated_at: string
          whatsapp: string | null
          youtube_url: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_full_name?: string
          company_name?: string
          country?: string | null
          email?: string | null
          email_alt?: string | null
          facebook_url?: string | null
          footer_note?: string | null
          founded_year?: number | null
          google_maps_url?: string | null
          id?: number
          instagram_url?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          map_embed_url?: string | null
          map_lat?: number | null
          map_lng?: number | null
          ntn_number?: string | null
          offices?: Json
          pec_number?: string | null
          phone?: string | null
          phone_alt?: string | null
          tagline?: string | null
          updated_at?: string
          whatsapp?: string | null
          youtube_url?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_full_name?: string
          company_name?: string
          country?: string | null
          email?: string | null
          email_alt?: string | null
          facebook_url?: string | null
          footer_note?: string | null
          founded_year?: number | null
          google_maps_url?: string | null
          id?: number
          instagram_url?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          map_embed_url?: string | null
          map_lat?: number | null
          map_lng?: number | null
          ntn_number?: string | null
          offices?: Json
          pec_number?: string | null
          phone?: string | null
          phone_alt?: string | null
          tagline?: string | null
          updated_at?: string
          whatsapp?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio: string | null
          created_at: string
          credentials: string | null
          email: string | null
          id: string
          is_published: boolean
          linkedin_url: string | null
          name: string
          photo_url: string | null
          role: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          credentials?: string | null
          email?: string | null
          id?: string
          is_published?: boolean
          linkedin_url?: string | null
          name: string
          photo_url?: string | null
          role?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          credentials?: string | null
          email?: string | null
          id?: string
          is_published?: boolean
          linkedin_url?: string | null
          name?: string
          photo_url?: string | null
          role?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      tenders: {
        Row: {
          category: string | null
          closes_at: string | null
          created_at: string
          description: string | null
          document_url: string | null
          id: string
          is_published: boolean
          published_on: string | null
          reference_no: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          closes_at?: string | null
          created_at?: string
          description?: string | null
          document_url?: string | null
          id?: string
          is_published?: boolean
          published_on?: string | null
          reference_no?: string | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          closes_at?: string | null
          created_at?: string
          description?: string | null
          document_url?: string | null
          id?: string
          is_published?: boolean
          published_on?: string | null
          reference_no?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author: string
          author_role: string | null
          avatar_url: string | null
          company: string | null
          created_at: string
          id: string
          is_published: boolean
          quote: string
          rating: number | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          author: string
          author_role?: string | null
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          quote: string
          rating?: number | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          author?: string
          author_role?: string | null
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          quote?: string
          rating?: number | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          category: string | null
          city: string | null
          company_name: string
          contact_person: string | null
          created_at: string
          document_url: string | null
          email: string
          id: string
          message: string | null
          ntn: string | null
          phone: string | null
          status: string
          website: string | null
        }
        Insert: {
          category?: string | null
          city?: string | null
          company_name: string
          contact_person?: string | null
          created_at?: string
          document_url?: string | null
          email: string
          id?: string
          message?: string | null
          ntn?: string | null
          phone?: string | null
          status?: string
          website?: string | null
        }
        Update: {
          category?: string | null
          city?: string | null
          company_name?: string
          contact_person?: string | null
          created_at?: string
          document_url?: string | null
          email?: string
          id?: string
          message?: string | null
          ntn?: string | null
          phone?: string | null
          status?: string
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "owner" | "admin" | "editor"
      project_status: "newly_launched" | "ongoing" | "completed" | "handed_over"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["owner", "admin", "editor"],
      project_status: ["newly_launched", "ongoing", "completed", "handed_over"],
    },
  },
} as const
