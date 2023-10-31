## classes

Return `Wrapper` DOM node classes.

Returns an Array of class names or a boolean if a class name is provided.

- **Arguments:**

  - `{string} className` **optional**

- **Returns:** `Array<{string}> | boolean`

- **Example:**

```js
import { mount } from 'vue2-test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.classes()).toContain('bar')
expect(wrapper.classes('bar')).toBe(true)
```
