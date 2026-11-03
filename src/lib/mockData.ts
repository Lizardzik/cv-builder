import type { CVData } from "@/types/cv";

export const mockCVData: CVData = {
  personalInfo: {
    firstName: "Jan",
    lastName: "Kowalski",
    jobTitle: "Fullstack .NET & React Developer",
    email: "jan.kowalski@example.com",
    phone: "123 456 789",
    city: "Kraków",
    postalCode: "30-001",
    github: "github.com/jankowalski",
    linkedin: "linkedin.com/in/jankowalski",
    dateOfBirth: "2002-05-14",
    photo: "",
    customLinks: [
      { label: "Portfolio", url: "jankowalski.dev" },
    ],
  },
  summary:
    "Programista specjalizujący się w tworzeniu aplikacji webowych w oparciu o C# (.NET 8) oraz React z TypeScript. Skupiam się na modułowej architekturze kodu, wydajności zapytań bazodanowych oraz czytelnych interfejsach użytkownika.",
  experience: [
    {
      company: "Tech Corp Sp. z o.o.",
      position: "Junior Fullstack Developer",
      startDate: "01.2025",
      endDate: "Obecnie",
      description:
        "<ul><li>Rozwój modułów backendowych w ASP.NET Core Web API oraz Entity Framework Core</li><li>Tworzenie reużywalnych komponentów frontendowych w React i TypeScript</li><li>Optymalizacja czasu odpowiedzi endpointów raportowych o 30%</li></ul>",
    },
  ],
  projects: [
    {
      name: "Subscription Tracker SaaS",
      role: "Fullstack Developer",
      technologies: "C#, .NET 8, EF Core, SQL Server, Blazor",
      url: "github.com/jankowalski/sub-tracker",
      description:
        "<ul><li>Zaprojektowanie architektury wielowarstwowej z uwierzytelnianiem JWT</li><li>Wdrożenie automatycznych powiadomień o zbliżających się płatnościach cyklicznych</li></ul>",
    },
    {
      name: "AI Resume Builder",
      role: "Frontend & Backend Developer",
      technologies: "React, TypeScript, Tailwind CSS, Express, Gemini API",
      url: "github.com/jankowalski/cv-builder",
      description:
        "<ul><li>Implementacja ekstraktora danych z plików PDF przy użyciu modeli językowych</li><li>Stworzenie silnika renderującego wielowariantowe szablony A4 w czasie rzeczywistym</li></ul>",
    },
  ],
  education: [
    {
      school: "Akademia Górniczo-Hutnicza w Krakowie",
      degree: "Informatyka i Ekonometria",
      startDate: "10.2023",
      endDate: "Obecnie",
    },
  ],
  skills: [
    { name: "C# / .NET 8" },
    { name: "ASP.NET Core Web API" },
    { name: "Entity Framework Core" },
    { name: "React" },
    { name: "TypeScript" },
    { name: "SQL Server" },
    { name: "Tailwind CSS" },
    { name: "Git" },
  ],
  languages: [
    { name: "Angielski", level: "B2" },
    { name: "Niemiecki", level: "A2" },
  ],
  courses: [
    { name: "INF.03 & INF.04 - Technik Programista", date: "2024" },
  ],
  clause:
    "Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO).",
  theme: {
    font: "font-sans",
    color: "#1d4ed8",
    textColor: "#18181b",
    backgroundColor: "#ffffff",
    spacing: 16,
    fontSize: 13,
    layout: "classic",
    customFont: "",
  },
};