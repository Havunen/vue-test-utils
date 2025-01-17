## setProps

Sets `Wrapper` `vm` props and forces update on each `Wrapper` in `WrapperArray`.

**Note every `Wrapper` must contain a Vue instance.**

- **Arguments:**

  - `{Object} props`

- **Example:**

```js
import { mount } from 'vue2-test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

test('setProps demo', async () => {
  const wrapper = mount(Foo)
  const barArray = wrapper.findAll(Bar)
  await barArray.setProps({ foo: 'bar' })
  expect(barArray.at(0).vm.foo).toBe('bar')
})
```
