## setData

Sets `Wrapper` `vm` data on each `Wrapper` in `WrapperArray`.

**Note every `Wrapper` must contain a Vue instance.**

- **Arguments:**

  - `{Object} data`

- **Example:**

```js
import { mount } from 'vue2-test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

test('setData demo', async () => {
  const wrapper = mount(Foo)
  const barArray = wrapper.findAll(Bar)
  await barArray.setData({ foo: 'bar' })
  expect(barArray.at(0).vm.foo).toBe('bar')
})
```
