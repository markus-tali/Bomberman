import ComponentBase from "../component.js";
import Bonus from "./bonus.js";
import { getBorder } from "../movement-impact.js";

// img taken from https://opengameart.org/content/lpc-tile-atlas

// Tile types enumeration
const TILE_TYPES = {
  WALL: 1,
  BLOCK: 2,
  PATH: 3,
  SPAWN: 0,
  SAFE_ZONE: 4,
  BONUS_1: 5,
  BONUS_2: 6,
  BONUS_3: 7,
  BONUS_4: 8,
  BONUS_5: 9,
};

export default class Map extends ComponentBase {
  constructor(atlas) {
    super("div", { class: "map-container", id: "map" });
    this.atlas = atlas;
    this.tileSize = 32;
    this.tileSetImage = "url(./js/blocks/game/media/world1-32x32.png)";
    this.bonusMap = [];
    this.initMap();
    return this;
  }

  initMap() {
    const wall = new ComponentBase("div", {
      class: "wall",
      style: `background-image: ${
        this.tileSetImage
      }; background-position: -${0}px -${0}px; width: ${
        this.tileSize
      }px; height: ${this.tileSize}px`,
    });
    const path = new ComponentBase("div", {
      class: "path",
      style: `background-image: ${
        this.tileSetImage
      }; background-position: -${32}px -${0}px; width: ${
        this.tileSize
      }px; height: ${this.tileSize}px`,
    });
    const shadow = new ComponentBase("div", {
      class: "shadow",
      style: `background-image: ${
        this.tileSetImage
      }; background-position: -${96}px -${0}px; width: ${
        this.tileSize
      }px; height: ${this.tileSize}px`,
    });
    const spawn = new ComponentBase("div", {
      class: "spawn",
      style: `background-image: ${
        this.tileSetImage
      }; background-position: -${32}px -${0}px; width: ${
        this.tileSize
      }px; height: ${this.tileSize}px`,
    });
    this.path = path;
    this.shadow = shadow;
    for (let y = 0; y < this.atlas.length; y++) {
      const lineMap = new ComponentBase("div", { class: "line" });
      for (let x = 0; x < this.atlas[y].length; x++) {
        let type = this.atlas[y][x];
        let block;
        switch (type) {
          case TILE_TYPES.WALL:
            block = wall;
            break;
          case TILE_TYPES.BLOCK:
            block = new ComponentBase("div", {
              class: "block",
              style: `background-color: #2f8136; background-image: ${
                this.tileSetImage
              }; background-position: -${64}px -${0}px; width: ${
                this.tileSize
              }px; height: ${this.tileSize}px`,
            });
            break;
          case TILE_TYPES.PATH:
            y > 0 && (this.atlas[y - 1][x] === 1 || this.atlas[y - 1][x] === 2)
              ? (block = shadow)
              : (block = path);
            break;
          case TILE_TYPES.SPAWN:
            block = spawn;
            break;
          case TILE_TYPES.SAFE_ZONE:
            y > 0 && (this.atlas[y - 1][x] === 1 || this.atlas[y - 1][x] === 2)
              ? (block = shadow)
              : (block = path);
            break;
          case TILE_TYPES.BONUS_1:
          case TILE_TYPES.BONUS_2:
          case TILE_TYPES.BONUS_3:
          case TILE_TYPES.BONUS_4:
          case TILE_TYPES.BONUS_5:
            block = new Bonus(
              this.atlas,
              this.tileSize,
              this.tileSetImage,
              type - TILE_TYPES.BONUS_1 + 1
            );
            const bonusBorder = getBorder(block.children[0], y, x);
            bonusBorder.borderLeft += 8;
            bonusBorder.borderRight -= 8;
            bonusBorder.borderUp += 8;
            bonusBorder.borderDown -= 8;
            this.bonusMap.push(bonusBorder);
            break;
          default:
            break;
        }
        if (block) {
          lineMap.addElement(block);
        }
      }
      this.addElement(lineMap);
    }
  }

  //  Removes a bonus from the game map.
  removeBonus(bonusData) {
    const top = this.children[bonusData.indexY - 1].children[bonusData.indexX];
    this.children[bonusData.indexY].children[bonusData.indexX] =
      top.props.class === "block" || top.props.class === "wall"
        ? this.shadow
        : this.path;
    this.bonusMap = this.bonusMap.filter(
      (bonus) =>
        bonus.indexX !== bonusData.indexX || bonus.indexY !== bonusData.indexY
    );
    this.updateContent();
  }
}
