import { z } from "zod";

export const cvSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(2, "Wymagane minimum 2 znaki"),
    lastName: z.string().min(2, "Wymagane minimum 2 znaki"),
    jobTitle: z.string().min(2, "Podaj docelowe stanowisko"),
    email: z.string().email("Niepoprawny format e-mail"),
    phone: z.string().optional(),
    github: z.string().optional(),
    linkedin: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().regex(/^\d{2}-\d{3}$/, "Format: XX-XXX").optional().or(z.literal("")),
    dateOfBirth: z.string().optional(),
    photo: z.string().optional(),
    customLinks: z
      .array(z.object({ label: z.string().min(1, "Nazwa"), url: z.string().min(1, "URL") }))
      .optional(),
  }),
  summary: z.string().optional(),
  experience: z.array(
    z.object({
      company: z.string().min(2, "Podaj nazwę firmy"),
      position: z.string().min(2, "Podaj stanowisko"),
      startDate: z.string().regex(/^(0[1-9]|1[0-2])\.\d{4}$/, "Format: MM.RRRR"),
      endDate: z
        .string()
        .regex(/^(0[1-9]|1[0-2])\.\d{4}$|^Obecnie$/, "Format: MM.RRRR lub Obecnie")
        .optional()
        .or(z.literal("")),
      description: z.string().optional(),
    })
  ),
  projects: z
    .array(
      z.object({
        name: z.string().min(2, "Podaj nazwę projektu"),
        role: z.string().optional(),
        technologies: z.string().optional(),
        url: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .optional(),
  education: z.array(
    z.object({
      school: z.string().min(2, "Podaj uczelnię"),
      degree: z.string().min(2, "Podaj kierunek"),
      startDate: z.string().regex(/^(0[1-9]|1[0-2])\.\d{4}$/, "Format: MM.RRRR"),
      endDate: z
        .string()
        .regex(/^(0[1-9]|1[0-2])\.\d{4}$|^Obecnie$/, "Format: MM.RRRR lub Obecnie")
        .optional()
        .or(z.literal("")),
    })
  ),
  skills: z.array(z.object({ name: z.string().min(1, "Wpisz umiejętność") })),
  languages: z
    .array(z.object({ name: z.string().min(1, "Wpisz język"), level: z.string() }))
    .optional(),
  courses: z
    .array(z.object({ name: z.string().min(1, "Wpisz kurs"), date: z.string().optional() }))
    .optional(),
  clause: z.string().optional(),
  theme: z
    .object({
      font: z.string(),
      color: z.string(),
      textColor: z.string().optional(),
      backgroundColor: z.string().optional(),
      spacing: z.number(),
      fontSize: z.number(),
      layout: z.string(),
      customFont: z.string().optional(),
    })
    .optional(),
});

export type CVData = z.infer<typeof cvSchema>;