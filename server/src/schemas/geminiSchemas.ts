import { Type } from "@google/genai";

export const cvSchemaResponse = {
  type: Type.OBJECT,
  properties: {
    personalInfo: {
      type: Type.OBJECT,
      properties: {
        firstName: { type: Type.STRING },
        lastName: { type: Type.STRING },
        jobTitle: { type: Type.STRING },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        city: { type: Type.STRING },
        postalCode: { type: Type.STRING },
        dateOfBirth: { type: Type.STRING },
        github: { type: Type.STRING },
        linkedin: { type: Type.STRING },
        customLinks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              url: { type: Type.STRING },
            },
            required: ["url"],
          },
        },
      },
      required: ["firstName", "lastName"],
    },
    summary: { type: Type.STRING },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING },
          position: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["company", "position", "startDate"],
      },
    },
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          role: { type: Type.STRING },
          technologies: { type: Type.STRING },
          url: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["name"],
      },
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          school: { type: Type.STRING },
          degree: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
        },
        required: ["school", "degree", "startDate"],
      },
    },
    skills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
        },
        required: ["name"],
      },
    },
    languages: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          level: { type: Type.STRING },
        },
        required: ["name", "level"],
      },
    },
    courses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          date: { type: Type.STRING },
        },
        required: ["name"],
      },
    },
    clause: { type: Type.STRING },
  },
  required: [
    "personalInfo",
    "summary",
    "experience",
    "education",
    "skills",
    "languages",
  ],
};

export const skillsSchemaResponse = {
  type: Type.ARRAY,
  items: {
    type: Type.STRING,
  },
};

export const jobMatchSchemaResponse = {
  type: Type.OBJECT,
  properties: {
    companyName: { type: Type.STRING },
    targetJobTitle: { type: Type.STRING },
    matchScore: { type: Type.NUMBER },
    matchingSkills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    missingSkills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    tailoredSummary: { type: Type.STRING },
    actionableAdvice: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: [
    "companyName",
    "targetJobTitle",
    "matchScore",
    "matchingSkills",
    "missingSkills",
    "tailoredSummary",
    "actionableAdvice",
  ],
};