## setProps(props)

- **Принимает:**

  - `{Object} props`

- **Использование:**

Устанавливает входные параметры `Wrapper` `vm` и выполняет принудительное обновление.

::: warning Обратите внимание!
`setProps` может быть вызван только на `wrapper` верхнего уровня, который был создан с помощью `mount` или `shallowMount`
:::

```js
import { mount } from 'vue2-test-utils'
import Foo from './Foo.vue'

test('setProps demo', async () => {
  const wrapper = mount(Foo)

  await wrapper.setProps({ foo: 'bar' })

  expect(wrapper.vm.foo).toBe('bar')
})
```

Вы также можете передать объект `propsData`, который инициализирует экземпляр Vue с переданными значениями.

```js
// Foo.vue
export default {
  props: {
    foo: {
      type: String,
      required: true
    }
  }
}
```

```js
import { mount } from 'vue2-test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo, {
  propsData: {
    foo: 'bar'
  }
})

expect(wrapper.vm.foo).toBe('bar')
```
