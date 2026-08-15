import type {
  Category,
  Control,
  EvalFixture,
  Framework,
  PolicyFlow,
  PolicyTemplate,
} from "@/types/domain";
import categoriesJson from "./categories.json";
import controlsJson from "./controls.json";
import fixturesJson from "./fixtures.json";
import flowsJson from "./flows.json";
import frameworksJson from "./frameworks.json";
import templatesJson from "./templates.json";

export const frameworks = frameworksJson as Framework[];
export const categories = categoriesJson as Category[];
export const controls = controlsJson as Control[];
export const templates = templatesJson as PolicyTemplate[];
export const fixtures = fixturesJson as EvalFixture[];
export const flows = flowsJson as PolicyFlow[];
