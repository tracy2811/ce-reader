import fs from "fs";
import readline from "readline";

const readInterface = readline.createInterface({
    input: fs.createReadStream("./ori/cedict_ts.u8"),
});

const writeStreamTraditional = fs.createWriteStream("./ce-traditional.json");
const writeStreamSimplified = fs.createWriteStream("./ce-simplified.json");

const dataTraditional = {};
const dataSimplified = {};

readInterface.on("line", (l) => {
    let text = l;
    let nextIndex = text.indexOf(" ");
    const traditional = text.slice(0, nextIndex);

    text = text.slice(nextIndex + 1);
    nextIndex = text.indexOf(" ");
    const simplified = text.slice(0, nextIndex);

    text = text.slice(nextIndex + 1);
    nextIndex = text.indexOf("]");
    const pinyin = text.slice(1, nextIndex).toLowerCase();

    text = text.slice(nextIndex + 3, text.length - 1);
    const meaning = text.split("/");

    if (dataTraditional[traditional]) {
        dataTraditional[traditional].push({
            traditional,
            simplified,
            pinyin,
            meaning,
        });
    } else {
        dataTraditional[traditional] = [
            { traditional, simplified, pinyin, meaning },
        ];
    }

    if (dataSimplified[simplified]) {
        dataSimplified[simplified].push({
            traditional,
            simplified,
            pinyin,
            meaning,
        });
    } else {
        dataSimplified[simplified] = [
            { traditional, simplified, pinyin, meaning },
        ];
    }
});

readInterface.on("close", () => {
    writeStreamTraditional.write(JSON.stringify(dataTraditional));
    writeStreamSimplified.write(JSON.stringify(dataSimplified));
    console.log(dataSimplified['现在']);
});
