import cc from 'conventional-changelog';
import {createWriteStream} from 'fs';

const version = process.env.VERSION
const file = `./RELEASE_NOTE_${version}.md`
const fileStream = createWriteStream(file)

cc({
  preset: 'angular',
  pkg: {
    transform(pkg) {
      pkg.version = `v${version}`
      return pkg
    }
  }
})
  .pipe(fileStream)
  .on('close', () => {
    console.log(`Generated release note at ${file}`)
  })
