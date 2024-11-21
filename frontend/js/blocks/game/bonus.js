import ComponentBase from "../component.js";

// icons from https://www.spriters-resource.com/fullview/170714/

export default class Bonus extends ComponentBase {
  constructor(atlas, tileSize, tileSetImage, bonusType) {
    super("div", {
      class: "covered",
      style: `background-color: #2f8136; width: ${tileSize}px; height: ${tileSize}px; display: flex; justify-content: center; align-items: center;`,
    });

    this.image = `url(./js/blocks/game/media/items.png)`;
    this.atlas = atlas;
    this.tileSize = tileSize;
    this.tileSetImage = tileSetImage;
    this.bonusType = bonusType;
    this.cover = new ComponentBase("div", {
      class: "block-cover",
      style: `background-image: ${
        this.tileSetImage
      }; background-position: -${64}px -${0}px; width: ${
        this.tileSize
      }px; height: ${this.tileSize}px`,
    });

    // Create the bonus image based on the bonus type
    switch (this.bonusType) {
      case 1:
        this.bonusImage = new ComponentBase(
          "div",
          {
            class: "bonus-item",
            bonus: "bomb",
            style: `background-image: ${
              this.image
            }; width: ${16}px; height: ${16}px; z-index: 30; background-position: -${0}px -${0}px;`,
          },
          "",
          this
        );
        break;
      case 2:
        this.bonusImage = new ComponentBase(
          "div",
          {
            class: "bonus-item",
            bonus: "blast",
            style: `background-image: ${
              this.image
            }; width: ${16}px; height: ${16}px; z-index: 30; background-position: -${16}px -${0}px;`,
          },
          "",
          this
        );
        break;
      case 3:
        this.bonusImage = new ComponentBase(
          "div",
          {
            class: "bonus-item",
            bonus: "speed",
            style: `background-image: ${
              this.image
            }; width: ${16}px; height: ${16}px; z-index: 30;background-position: -${32}px -${0}px;`,
          },
          "",
          this
        );
        break;
      case 4:
        this.bonusImage = new ComponentBase(
          "div",
          {
            // can move through bombs
            class: "bonus-item",
            bonus: "escape",
            style: `background-image: ${
              this.image
            }; width: ${16}px; height: ${16}px; z-index: 30;background-position: -${48}px -${0}px;`,
          },
          "",
          this
        );
        break;
      case 5:
        this.bonusImage = new ComponentBase(
          "div",
          {
            class: "bonus-item",
            bonus: "life",
            style: `background-image: ${
              this.image
            }; width: ${16}px; height: ${16}px; z-index: 30;background-position: -${64}px -${0}px;`,
          },
          "",
          this
        );
        break;
      default:
        break;
    }

    // Add the bonus image and cover to the component
    this.addElement(this.bonusImage);
    this.addElement(this.cover);
  }
}
