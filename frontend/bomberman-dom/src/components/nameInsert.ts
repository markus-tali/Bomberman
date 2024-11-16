import { ComponentBase, ContentNode, createButton, createEl, createInputEl } from "../../../framework"
// import {RoutingService} from "../services/routingService.ts";


export class InsertName extends ComponentBase{
    // private readonly _routingService: RoutingService
    constructor(){
        super("InsertName")

        
        const title= createEl<HTMLHeadElement>("h1", { className: "title-class" }, ["Insert your nickname"])


        const insertButton: HTMLButtonElement = createEl<HTMLButtonElement>("button", "", ["Insert Button"]);
        insertButton.type = "submit";

        //Textbox
        const form = createEl<HTMLFormElement>("form", "", [
            createInputEl("text", "content", true, "form-text-input"),
            insertButton
        ]);

        form.addEventListener("submit", (event) =>{
            event.preventDefault();
            const data = new FormData(form);
            const content = data.get("content") as string ;
            console.log("this is our data:", content)
        })
        this.replaceContent([
            [title, []],
            [form, []]
        ])
        
        
              //language=CSS
              this.injectStyle(`
                & {
                    background: #ffffff;
                }
                
                .name {
                    margin-right: 10px;
                }
    
                .button {
                    flex: 0 0 auto;
                }
                      .form-text-input {
        width: 300px; /* Sisestusvälja laius */
        padding: 10px; /* Sisestusvälja sisemine täitmine */
        border: 1px solid #ccc; /* Serva stiil */
        border-radius: 5px; /* Ümarad nurgad */
        font-size: 16px; /* Teksti suurus */

          .button {
        margin-top: 10px;
        padding: 10px 15px;
        background-color: #007BFF;
        color: #fff;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    .button:hover {
        background-color: #0056b3;
    }
    }
            `);
 
     
    }


}