import { useCallback } from "react";
import { useCustomFetch } from "src/hooks/useCustomFetch";
import { SetTransactionApprovalParams } from "src/utils/types";
import { TransactionPane } from "./TransactionPane";
import { SetTransactionApprovalFunction, TransactionsComponent } from "./types";

export const Transactions: TransactionsComponent = ({
	transactions,
	isLoading,
}) => {
	const { fetchWithoutCache, loading } = useCustomFetch();

	const setTransactionApproval = useCallback<SetTransactionApprovalFunction>(
		async ({ transactionId, newValue }) => {
			await fetchWithoutCache<void, SetTransactionApprovalParams>(
				"setTransactionApproval",
				{
					transactionId,
					value: newValue,
				}
			);
		},
		[fetchWithoutCache]
	);

	return (
		<>
			<div data-testid="transaction-container">
				{transactions?.map((transaction) => (
					<TransactionPane
						key={transaction.id}
						transaction={transaction}
						loading={loading}
						setTransactionApproval={setTransactionApproval}
					/>
				))}
			</div>
			{isLoading && <div className="RampLoading--container">Loading...</div>}
		</>
	);
};
