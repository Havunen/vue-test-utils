## isVueInstance()

Проверка, что `Wrapper` является экземпляром Vue.

- **Возвращает:** `{boolean}`

- **Пример:**

```js
import { mount } from 'vue2-test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isVueInstance()).toBe(true)
```
