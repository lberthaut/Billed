
import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, firestore, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.firestore = firestore
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    new Logout({ document, localStorage, onNavigate })
  }
  handleChangeFile = e => {
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    const filePath = e.target.value.split(/\\/g)
    const fileName = filePath[filePath.length-1]
    const split = fileName.split(".");
    const extension = split[split.length-1];
    if(extension == "jpg" || extension == "jpeg" || extension == "png"){
      this.firestore.storage.ref(`justificatifs/${fileName}`).put(file).then(snapshot => snapshot.ref.getDownloadURL()).then(url => {
        this.fileUrl = url
        this.fileName = fileName
      })
    }else{
      alert("Ce type de fichier n'est pas supporté. Veuillez joindre un fichier .jpg, .jpeg, ou .png");
      this.document.querySelector(`input[data-testid="file"]`).value = "";
    }
  }
  handleSubmit = e => {
    e.preventDefault()
    console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    this.createBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
 /* document.querySelector(`input[data-testid="file"]`).reportValidity();

if (!hasExtension(document.querySelector(`input[data-testid="file"]`), ['.jpg', '.gif', '.png'])) {
  alert("Ce type de fichier n'est pas supporté. Veuillez joindre un fichier .jpg, .jpeg, ou .png")
}
function hasExtension(inputID, exts) {
  var fileName = document.getElementById(inputID).nodeValue;
  return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$')).test(fileName);
} */
  }
  
  // not need to cover this function by tests
  createBill = (bill) => {
    if (this.firestore) {
      this.firestore.bills().add(bill).then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => error)
    }
  }
}