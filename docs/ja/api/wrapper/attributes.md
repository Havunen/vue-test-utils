## attributes()

`Wrapper` にラップされている要素の属性をオブジェクトで返します。

- **戻り値:** `{[attribute: string]: any}`

- **例:**

```js
import { mount } from 'vue2-test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.attributes().id).toBe('foo')
```
