import { sendTx } from './ethers.service';
import { pollUntilIndexed } from './has-transaction-been-indexed'

export const sendTransaction = async (transactionParameters) => {
  const txHash = await sendTx(transactionParameters);
  
  await pollUntilIndexed(txHash);
  
  // all indexed and can carry on, please note you can allow the user to carry on
  // after the tx hash and maybe move this process to a component which shows them
  // current pending transactions. This is just showing you the sync method where you
  // wait until indexed before carrying on. 
}