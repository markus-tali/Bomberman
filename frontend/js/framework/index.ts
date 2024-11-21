import {ComponentBase, ContentNode} from "./components.ts";
import {getUid, createEl, createInputEl, createButton, createSelectOption} from "./utils.ts";
import {ElOptions, RouteModel} from "./models.ts";
import {RouterBase} from "./router.ts";

/**
 * @class ComponentBase - Base component
 *
 * @function createEl - create basic elements
 *
 * @function createInputEl - create input elements
 *
 * @function createButton - create buttons
 *
 * @function createSelectOption - create select options
 */
export {ComponentBase, RouterBase, createEl, createInputEl, createButton, createSelectOption, getUid};

export type {ContentNode, ElOptions, RouteModel};

