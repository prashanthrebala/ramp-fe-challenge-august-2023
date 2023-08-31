import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { InputSelect } from "./components/InputSelect";
import { Instructions } from "./components/Instructions";
import { Transactions } from "./components/Transactions";
import { useEmployees } from "./hooks/useEmployees";
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions";
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee";
import { EMPTY_EMPLOYEE } from "./utils/constants";
import { Employee, Transaction } from "./utils/types";

export function App() {
	const { data: employees, ...employeeUtils } = useEmployees();
	const { data: paginatedTransactions, ...paginatedTransactionsUtils } =
		usePaginatedTransactions();
	const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } =
		useTransactionsByEmployee();
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
	const [showViewMore, setShowViewMore] = useState(true);

	const transactions = useMemo(
		() => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
		[paginatedTransactions, transactionsByEmployee]
	);

	const [results, setResults] = useState([] as Transaction[]);

	useEffect(() => {
		if (transactions != null) {
			setResults([...results, ...transactions]);
			setShowViewMore(true);
		}
		if (paginatedTransactions?.nextPage === null) {
			setShowViewMore(false);
		}
		if (transactionsByEmployee != null) {
			setResults(transactionsByEmployee);
			setShowViewMore(false);
		}
	}, [transactions, transactionsByEmployee]);

	const loadAllTransactions = useCallback(async () => {
		setIsLoading(true);
		setIsLoadingEmployees(true);
		transactionsByEmployeeUtils.invalidateData();
		setIsLoadingEmployees(false);
		await employeeUtils.fetchAll();
		await paginatedTransactionsUtils.fetchAll();

		setIsLoading(false);
	}, [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils]);

	const loadTransactionsByEmployee = useCallback(
		async (employeeId: string) => {
			paginatedTransactionsUtils.invalidateData();
			await transactionsByEmployeeUtils.fetchById(employeeId);
		},
		[paginatedTransactionsUtils, transactionsByEmployeeUtils]
	);

	useEffect(() => {
		if (employees === null && !employeeUtils.loading) {
			loadAllTransactions();
		}
	}, [employeeUtils.loading, employees, loadAllTransactions]);

	return (
		<Fragment>
			<main className="MainContainer">
				<Instructions />

				<hr className="RampBreak--l" />

				<InputSelect<Employee>
					isLoading={isLoadingEmployees}
					defaultValue={EMPTY_EMPLOYEE}
					items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
					label="Filter by employee"
					loadingLabel="Loading employees"
					parseItem={(item) => ({
						value: item.id,
						label: `${item.firstName} ${item.lastName}`,
					})}
					onChange={async (newValue) => {
						if (newValue === null) {
							return;
						}
						setResults([]);
						setIsLoading(true);
						newValue.id
							? await loadTransactionsByEmployee(newValue.id)
							: await loadAllTransactions();
						setIsLoading(false);
					}}
				/>

				<div className="RampBreak--l" />

				<div className="RampGrid">
					<Transactions transactions={results} isLoading={isLoading} />

					{transactions !== null && showViewMore && (
						<button
							className="RampButton"
							disabled={paginatedTransactionsUtils.loading}
							onClick={async () => {
								await loadAllTransactions();
							}}
						>
							View More
						</button>
					)}
				</div>
			</main>
		</Fragment>
	);
}
