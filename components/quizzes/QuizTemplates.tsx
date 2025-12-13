import { QuizQuestion } from "./QuizBuilder";

export interface QuizTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  questions: Omit<QuizQuestion, "id" | "order">[];
  duration: number;
  passingScore: number;
}

export const aviationQuizTemplates: QuizTemplate[] = [
  {
    id: "ppl-general",
    name: "Private Pilot License - General Knowledge",
    description: "Essential knowledge test for PPL candidates",
    category: "PPL",
    difficulty: "beginner",
    duration: 60,
    passingScore: 70,
    questions: [
      {
        type: "multiple_choice",
        question:
          "What is the minimum altitude for VFR flight over congested areas?",
        options: [
          "500 feet AGL",
          "1,000 feet AGL",
          "1,500 feet AGL",
          "2,000 feet AGL",
        ],
        correctAnswer: "1",
        points: 2,
        explanation:
          "FAA regulations require a minimum of 1,000 feet above the highest obstacle within a 2,000-foot radius over congested areas.",
      },
      {
        type: "multiple_choice",
        question: "What does the acronym VFR stand for?",
        options: [
          "Visual Flight Rules",
          "Variable Flight Regulations",
          "Vertical Flight Reference",
          "Visual Flight Reference",
        ],
        correctAnswer: "0",
        points: 1,
        explanation:
          "VFR stands for Visual Flight Rules, which are regulations that allow pilots to fly by visual references.",
      },
      {
        type: "true_false",
        question:
          "A pilot must have a valid medical certificate to operate an aircraft under Part 91.",
        correctAnswer: "true",
        points: 1,
        explanation:
          "Except for certain sport pilot operations, a valid medical certificate is required for Part 91 operations.",
      },
      {
        type: "multiple_choice",
        question: "What is the standard atmospheric pressure at sea level?",
        options: [
          "28.92 inches Hg",
          "29.92 inches Hg",
          "30.92 inches Hg",
          "31.92 inches Hg",
        ],
        correctAnswer: "1",
        points: 2,
        explanation:
          "Standard atmospheric pressure at sea level is 29.92 inches of mercury (Hg) or 1013.25 hectopascals.",
      },
    ],
  },
  {
    id: "cpl-navigation",
    name: "Commercial Pilot - Navigation",
    description: "Advanced navigation concepts for CPL",
    category: "CPL",
    difficulty: "intermediate",
    duration: 90,
    passingScore: 75,
    questions: [
      {
        type: "multiple_choice",
        question:
          "What is the purpose of the isogonic lines on aeronautical charts?",
        options: [
          "To show areas of equal magnetic variation",
          "To show areas of equal altitude",
          "To show areas of equal wind speed",
          "To show areas of equal visibility",
        ],
        correctAnswer: "0",
        points: 2,
        explanation:
          "Isogonic lines connect points of equal magnetic variation, helping pilots correct for the difference between true and magnetic north.",
      },
      {
        type: "multiple_choice",
        question:
          "When flying from a high-pressure area to a low-pressure area, the aircraft will:",
        options: [
          "Fly higher than indicated",
          "Fly lower than indicated",
          "Maintain the same altitude",
          "Experience increased headwinds",
        ],
        correctAnswer: "1",
        points: 2,
        explanation:
          "When flying from high to low pressure, the aircraft will actually fly lower than indicated ('High to Low, Look Out Below').",
      },
      {
        type: "short_answer",
        question:
          "What is the magnetic heading if the true heading is 090° and the magnetic variation is 15° East?",
        correctAnswer: "075",
        points: 3,
        explanation:
          "With easterly variation, subtract it from true heading: 090° - 15° = 075° magnetic.",
      },
    ],
  },
  {
    id: "atpl-meteorology",
    name: "ATPL - Meteorology",
    description: "Comprehensive weather knowledge for airline pilots",
    category: "ATPL",
    difficulty: "advanced",
    duration: 120,
    passingScore: 80,
    questions: [
      {
        type: "multiple_choice",
        question:
          "At what altitude does the tropopause typically occur at mid-latitudes?",
        options: [
          "20,000 - 25,000 feet",
          "30,000 - 35,000 feet",
          "36,000 - 40,000 feet",
          "45,000 - 50,000 feet",
        ],
        correctAnswer: "2",
        points: 3,
        explanation:
          "The tropopause at mid-latitudes typically occurs around 36,000 to 40,000 feet, marking the boundary between the troposphere and stratosphere.",
      },
      {
        type: "multiple_choice",
        question: "What type of clouds are associated with a cold front?",
        options: [
          "Cirrus and cirrostratus",
          "Cumulonimbus and cumulus",
          "Stratus and nimbostratus",
          "Altocumulus and altostratus",
        ],
        correctAnswer: "1",
        points: 2,
        explanation:
          "Cold fronts typically produce cumulonimbus and cumulus clouds due to the rapid lifting of warm air.",
      },
      {
        type: "true_false",
        question:
          "Clear air turbulence (CAT) is most commonly found near the jet stream.",
        correctAnswer: "true",
        points: 2,
        explanation:
          "CAT is most frequently encountered in the vicinity of the jet stream where there are strong wind shears.",
      },
    ],
  },
  {
    id: "aircraft-systems",
    name: "Aircraft Systems & Components",
    description: "Understanding aircraft mechanical and electrical systems",
    category: "General",
    difficulty: "intermediate",
    duration: 75,
    passingScore: 75,
    questions: [
      {
        type: "multiple_choice",
        question: "What is the primary purpose of the pitot-static system?",
        options: [
          "Measure airspeed, altitude, and vertical speed",
          "Measure engine performance",
          "Provide hydraulic pressure",
          "Control fuel flow",
        ],
        correctAnswer: "0",
        points: 2,
        explanation:
          "The pitot-static system provides pressure measurements for airspeed indicator, altimeter, and vertical speed indicator.",
      },
      {
        type: "multiple_choice",
        question: "Which instrument is powered by the vacuum system?",
        options: [
          "Airspeed indicator",
          "Attitude indicator",
          "Altimeter",
          "Turn coordinator",
        ],
        correctAnswer: "1",
        points: 2,
        explanation:
          "The attitude indicator (artificial horizon) is typically powered by the vacuum system in most aircraft.",
      },
      {
        type: "true_false",
        question:
          "Carburetor ice can form even when the outside air temperature is above freezing.",
        correctAnswer: "true",
        points: 1,
        explanation:
          "Carburetor ice can form at temperatures up to 70°F (21°C) due to the cooling effect of fuel evaporation and pressure drop.",
      },
    ],
  },
  {
    id: "regulations-airspace",
    name: "Aviation Regulations & Airspace",
    description: "FAA regulations and airspace classification",
    category: "Regulations",
    difficulty: "intermediate",
    duration: 60,
    passingScore: 75,
    questions: [
      {
        type: "multiple_choice",
        question:
          "What is the minimum visibility required for VFR flight in Class D airspace?",
        options: [
          "1 statute mile",
          "3 statute miles",
          "5 statute miles",
          "10 statute miles",
        ],
        correctAnswer: "1",
        points: 2,
        explanation:
          "Class D airspace requires 3 statute miles visibility for VFR operations.",
      },
      {
        type: "multiple_choice",
        question: "Class A airspace extends from:",
        options: [
          "Surface to 10,000 feet MSL",
          "10,000 feet MSL to 18,000 feet MSL",
          "18,000 feet MSL to FL600",
          "FL600 to unlimited",
        ],
        correctAnswer: "2",
        points: 2,
        explanation:
          "Class A airspace extends from 18,000 feet MSL up to Flight Level 600.",
      },
      {
        type: "true_false",
        question:
          "A transponder with Mode C is required in all Class C airspace.",
        correctAnswer: "true",
        points: 1,
        explanation:
          "Mode C (altitude encoding) transponder is required for operations in Class C airspace.",
      },
    ],
  },
];

export function getTemplatesByCategory(category?: string): QuizTemplate[] {
  if (!category) return aviationQuizTemplates;
  return aviationQuizTemplates.filter((t) => t.category === category);
}

export function getTemplatesByDifficulty(
  difficulty: "beginner" | "intermediate" | "advanced"
): QuizTemplate[] {
  return aviationQuizTemplates.filter((t) => t.difficulty === difficulty);
}
