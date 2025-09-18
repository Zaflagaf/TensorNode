import { useEffect } from "react"
import { useNodesStore } from "../store/nodesStore"
import { useEdgesStore } from "../store/edgesStore"
import propagatePorts from "../lib/propagatePorts"
import useSaveWorkflow from "./useSaveWorkflow"

const useCleverPropagation = () => {

    const nodes = useNodesStore((state) => state.nodes)    
    const edges = useEdgesStore((state) => state.edges)

    const setNodes = useNodesStore((state) => state.actions.setNodes)

    useEffect(() => {
        const propagateNodes = propagatePorts(nodes, edges)
        setNodes(propagateNodes)
    },[nodes, edges])
}

export default useCleverPropagation