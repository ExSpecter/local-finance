export default function readFile(file) {
    if(!file) return;
    return new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");

        reader.onload = (event) => resolve(event.target.result)

        reader.onerror = function (evt) {
            reject("error reading file");
        }
    });
}