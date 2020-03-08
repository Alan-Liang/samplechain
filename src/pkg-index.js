// entrypoint of the packaged version
import './fe-server'
import './api-server'

import { pkgVer } from './_pkg-ver'

console.log(`[INFO] Samplechain running on Node ${process.version}, packaged with pkg@${pkgVer}`)
