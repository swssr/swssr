/**
 * TABLE OF CONTENTS
 * 1. Interfaces
 * 2. Actions, creator functions
 * 3. implementation
 */

//1. Interfaces
interface CaseStudy {
  project: {
    product: String;
    goals: string[];
    startingAssets?: string[];
    startDate: Date;
    completeDate: Date;
  };
  client: {
    name: String;
    industry: String;
  };
  study: {
    whatIdid: string[];
    weakness?: Article[];
    oppotunities: Article[];
    solutions: Article[];
    toolsUsed: string[];
  };
}

interface Article {
  head: String;
  body: String;
  assets?: String[];
}

interface extUrl {
  name: String;
  url: URL;
}

//2. Actions
function createCaseStudy(caseStudy: CaseStudy) {
  return caseStudy;
}

//3. Implementation
const TumisongDJ = createCaseStudy({
  client: {
    name: "Tumisong",
    industry: "Entertainment"
  },
  project: {
    product: "Website for bookings and events and other cool stuff",
    goals: [
      "Be able to create events",
      "Able to upload playlists and mixes",
      "Show events"
    ],
    startDate: new Date("12 feb 2018"),
    completeDate: new Date("23 July 2018")
  },
  study: {
    whatIdid: ["UX & UI Design", "Development"],
    oppotunities: [
      {
        head: "Make something that looks cool",
        body: "lorem ipsum dolor ",
        assets: [""]
      }
    ],
    solutions: [
      {
        head: "Build a serve all website",
        body: "Will serve as his bio, event manager, music platform"
      }
    ],
    toolsUsed: ["Adobe XD", "Vanilla Javascript", "NodeJS"]
  }
});

TumisongDJ;
