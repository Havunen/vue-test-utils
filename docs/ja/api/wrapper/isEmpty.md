## isEmpty()

`Wrapper` が子ノードを含んでいないか検証します。

- **戻り値:** `{boolean}`

- **例:**

```js
import { mount } from 'vue2-test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isEmpty()).toBe(true)
```
