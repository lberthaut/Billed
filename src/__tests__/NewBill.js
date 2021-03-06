import {setLocalStorage} from "../../setup-jest"
import { fireEvent, screen} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import firestore from "../app/Firestore.js"
import {errorPage404, errorPage500} from "../__mocks__/ErrorPage"
import {mockBills} from "../__mocks__/firebase"



// Setup
const onNavigate= () => {return}
setLocalStorage('Employee')
Object.defineProperty(window, "location", { value: {hash: "#employee/bill/new"} })

describe("Given I am connected as an employee", () => {
  describe("When I browse on NewBill Page", () => {
    test("Then the newbill's page should load", () => {
      document.body.innerHTML= NewBillUI()
      expect(screen.getAllByText("Type de dépense")).toBeTruthy()
    })
  })
  describe("When I'm on NewBill Page", () => {
      test("Then the file's input should show the file when I upload it", () => {
        document.body.innerHTML= NewBillUI()
        const mockNewBill= new NewBill({ document, firestore: firestore, onNavigate, localStorage: window.localStorage })
        const handleChangeFile= jest.fn(() => mockNewBill.handleChangeFile)
        const inputFile= screen.getByTestId("file")
        inputFile.addEventListener("change", handleChangeFile)
        fireEvent.change(inputFile, {
            target: {
                files: [new File(["test.jpg"], "test.jpg", { type: "image/jpg" })],
            }
        })
        expect(inputFile.files[0].name).toBe("test.jpg")
      })
    describe("And I upload a non-supported file", () => {
      test("Then the alert message should be open", async () => {
        document.body.innerHTML = NewBillUI()
        const mockNewBill= new NewBill({ document, firestore: firestore, onNavigate, localStorage: window.localStorage })
        const handleChangeFile= jest.fn(() => mockNewBill.handleChangeFile)
        const loadedFile= screen.getByTestId("file")
        loadedFile.addEventListener("change", handleChangeFile)
        fireEvent.change(loadedFile, {
            target: {
                files: [new File(["test.pdf"], "test.pdf", { type: "application/pdf" })],
            }
        })
        expect(handleChangeFile).toBeCalled()
      })
    })

    // test d'intégration POST
    describe("I submit a agreed bill", () => {
      test('then the bill is created in bills page', async () => {
        document.body.innerHTML= NewBillUI()
        const mockNewBill= new NewBill({ document, firestore: firestore, onNavigate, localStorage: window.localStorage })
        const submitBill= screen.getByTestId('form-new-bill')
        const validBills= await mockBills.get();
        const validBill= validBills.data[0];
        const handleSubmit = jest.fn((e) => mockNewBill.handleSubmit(e))
        mockNewBill.createBill = (newBill) => newBill
        document.querySelector(`select[data-testid="expense-type"]`).value = validBill.type
        document.querySelector(`input[data-testid="expense-name"]`).value = validBill.name
        document.querySelector(`input[data-testid="datepicker"]`).value = validBill.date
        document.querySelector(`input[data-testid="amount"]`).value = validBill.amount
        document.querySelector(`input[data-testid="vat"]`).value = validBill.vat
        document.querySelector(`input[data-testid="pct"]`).value = validBill.pct
        document.querySelector(`textarea[data-testid="commentary"]`).value = validBill.commentary
        mockNewBill.fileName = validBill.fileName 
        mockNewBill.fileUrl = validBill.fileUrl
        submitBill.addEventListener('click', handleSubmit)
        fireEvent.click(submitBill)
        expect(handleSubmit).toHaveBeenCalled()
      })
      test("New Bill is submit and fails with 404 message error", async () => {
        errorPage404();
        document.body.innerHTML= "Erreur 404";
        const message= await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("fetches messages from an API and fails with 500 message error", async ()=>{
        errorPage500();
        document.body.innerHTML= "Erreur 500";
        const message= await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    })
  })
})