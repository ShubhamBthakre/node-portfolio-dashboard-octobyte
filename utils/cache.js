import NodeCache from "node-cache"

const cache = new NodeCache({
  stdTTL: 15,
})

export default cache