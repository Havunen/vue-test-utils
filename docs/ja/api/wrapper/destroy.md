## destroy()

Vue コンポーネントインスタンスを破棄します。

- **例:**

```js
import { mount } from 'vue2-test-utils'
import sinon from 'sinon'

const spy = sinon.stub()
mount({
  render: null,
  destroyed() {
    spy()
  }
}).destroy()
expect(spy.calledOnce).toBe(true)
```
