import { useCallback, useEffect, useState } from "react";
import { useBoolean } from "@chakra-ui/react";

function useApproval(owner?: string, operator?: string) {
  const [isApproved, setIsApproved] = useState<boolean>();
  const [isApproving, { on, off }] = useBoolean();

  const fetchApproval = useCallback(async () => {
    if (!owner || !operator) {
      setIsApproved(false);
      return;
    }
    setIsApproved(true);
  }, [owner, operator]);

  useEffect(() => {
    fetchApproval();
  }, [fetchApproval]);

  const approve = useCallback(async () => {
    if (!operator) return;
    on();
    try {
    } finally {
      off();
    }
  }, [operator, on, off]);

  // If autoLoad is enabled and the the wallet had been loaded before, load it automatically now.
  useEffect(() => {}, []);

  return { isApproved, isApproving, approve };
}

export default useApproval;
