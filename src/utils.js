export var utils = {
    formatSignature : formatSignature,
    formatDate : formatDate
}

function formatSignature(signature) {
    var anonymousSignature = {
        name : "Nafnlaus",
        signed : signature.signed,
        comment : ""
    };
    if(signature.anonymous) return anonymousSignature;
    else return signature;
}

function formatDate(date) {
    const newDate = new Date(date);
    let day = newDate.getDate();
    let month = newDate.getMonth()+1;
    let year = newDate.getFullYear();
    if(day < 10) day = '0'+day;
    if(month < 10) month = '0'+month;
    return `${day}.${month}.${year}`;
    
}