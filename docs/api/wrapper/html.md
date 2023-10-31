## html

Returns HTML of `Wrapper` DOM node as a string.

- **Returns:** `{string}`

- **Example:**

```js
import { mount } from 'vue2-test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.html()).toBe('<div><p>Foo</p></div>')
```
