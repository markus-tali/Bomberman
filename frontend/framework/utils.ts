import {ElOptions} from "./models.ts";

let nextId = 0;

export function getUid(): number {
  return nextId++;
}

export function createEl<T extends HTMLElement>(tag: string, elOptions?: ElOptions, content?: (string | HTMLElement)[]): T {
  const el = document.createElement(tag);
  if (content) {
    for (const contentEl of content) {
      if (typeof contentEl === "string") {
        el.appendChild(document.createTextNode(contentEl));
      } else {
        el.appendChild(contentEl);
      }
    }
  }
  if (elOptions) {
    if(elOptions.className) {
      el.className = elOptions.className;
    }
    if(elOptions.onClick) {
      el.addEventListener("click", elOptions.onClick);
    }
    if(elOptions.onKeyDown) {
      el.addEventListener("keydown", elOptions.onKeyDown);
    }
    if(elOptions.onDblClick) {
      el.addEventListener("dblclick", elOptions.onDblClick);
    }
    if(elOptions.attributes) {
      for (const [key, value] of Object.entries(elOptions.attributes)) {
        if (value !== undefined) {
          if (typeof value === "boolean") {
            (el as any)[key] = value;
          } else {
            el.setAttribute(key, value.toString());
          }
        }
      }
    }
  }
  return el as T;
}

export function createInputEl(type: string, name: string, required: boolean = false, className?: string): HTMLInputElement {
  const elOptions: ElOptions = {
    className: className,
    attributes: {
      name: name,
      required: required,
      type: type,
    }
  }
  return createEl<HTMLInputElement>("input", elOptions);
}

export function createButton(label: string, className: string, onClick: () => void): HTMLButtonElement {
  const elOptions = {
    className: className,
    onClick: onClick,
    attributes: {
      type: "button",
    }
  }
  return createEl<HTMLButtonElement>("button", elOptions, [label]);
}

export function createSelectOption(value: string, label: string, initial?: boolean): HTMLOptionElement {
  const el = createEl<HTMLOptionElement>("option", {attributes: {value: value}}, [label]);
  if (initial) {
    el.disabled = true;
    el.selected = true;
  }
  return el;
}