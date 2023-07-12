/**
 * @jest-environment jsdom
 */
import { fireEvent, screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'

import { ROUTES, ROUTES_PATH} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store.js"

import router from "../app/Router.js"
import NewBill from "../containers/NewBill.js"
import NewBillUI from "../views/NewBillUI.js"
import BillsUI from "../views/BillsUI.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon.classList.contains('active-icon')).toBe(true)
  })
  //describe newbill page
  test("Then a user can fill up the form", () => {
    userEvent.type(screen.getByTestId("expense-name"), "Manual Test");
    expect(screen.getByTestId("expense-name").value).toMatch("Manual Test");

    userEvent.type(screen.getByTestId("amount"), "10");
    expect(screen.getByTestId("amount").value).toMatch("10");

    userEvent.type(screen.getByTestId("datepicker"), "");
    expect(screen.getByTestId("datepicker").value).toMatch("");

    userEvent.type(screen.getByTestId("vat"), "01");
    expect(screen.getByTestId("vat").value).toMatch("01");

    userEvent.type(screen.getByTestId("pct"), "15");
    expect(screen.getByTestId("pct").value).toMatch("15");

    userEvent.type(
      screen.getByTestId("commentary"),
      "some text with Commentry and Numbers 10"
    );
    expect(screen.getByTestId("commentary").value).toMatch(
      "some text with Commentry and Numbers 10"
    );
  });
  test("Then I should be able to choose an expense from a list", () => {
    userEvent.selectOptions(screen.getByTestId("expense-type"), [
      screen.getByText("Services en ligne"),
    ]);
    expect(screen.getByTestId("expense-type").value).toMatch(
      "Services en ligne"
    );
  });
  })
})

describe('When user submits data for new bill', () => {
  test("Then it should create a new bill containing that data", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem(
          'user',
          JSON.stringify({
              type: 'Employee',
              email: 'a@a.com',
          })
      )
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      const validBill = {
          type: "Hôtel et logement",
          name: "encore",
          date: '2004-04-04',
          amount: 400,
          vat: 80,
          pct: 20,
          commentary: 'séminaire billed',
          fileUrl: 'https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a',
          fileName: 'preview-facture-free-201801-pdf-1.jpg',
          status: 'pending'
      }
      screen.getByTestId('expense-type').value = validBill.type
      screen.getByTestId('expense-name').value = validBill.name
      screen.getByTestId('datepicker').value = validBill.date
      screen.getByTestId('amount').value = validBill.amount
      screen.getByTestId('vat').value = validBill.vat
      screen.getByTestId('pct').value = validBill.pct
      screen.getByTestId('commentary').value = validBill.commentary
      newBill.fileName = validBill.fileName
      newBill.fileUrl = validBill.fileUrl
      
      newBill.updateBill = jest.fn()
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))

      const form = screen.getByTestId("form-new-bill")
      form.addEventListener("submit", handleSubmit)
      fireEvent.submit(form)

      expect(handleSubmit).toHaveBeenCalled()
      expect(newBill.updateBill).toHaveBeenCalled()
  })
})
