/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon).toHaveClass("active-icon");

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("When I click on the 'new bill' button, I should be redirected to the 'new bill' page", async () => {
      // Set up
      const onNavigate = jest.fn();
      document.body.innerHTML = BillsUI({ data: [] });
      const root = document.getElementById("root");
      const billPage = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });
      const buttonNewBill = screen.getByTestId("btn-new-bill");

      // Action
      buttonNewBill.dispatchEvent(new MouseEvent("click", { bubbles: true }));

      // Assert
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.NewBill);
    })


  })
})

describe("When I click on icon eye", () => {
  test("Then it should open the bill modal", () => {
      const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({data : bills})
      const myBills = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage })

      $.fn.modal = jest.fn() //mocks the jQuery modal function for easier testing

      const iconEye = screen.getAllByTestId("icon-eye")[0]
      const handleClickIconEye = jest.fn(myBills.handleClickIconEye(iconEye))

      iconEye.addEventListener("click", handleClickIconEye())
      userEvent.click(iconEye)
      expect(handleClickIconEye).toHaveBeenCalled()
      expect(screen.getByText("Justificatif")).toBeTruthy()
  })
})



