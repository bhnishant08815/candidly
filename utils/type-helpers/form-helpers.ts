import { Locator, Page, expect } from '@playwright/test';
import { FillOptions, SelectOption } from './common-types';

/**
 * Type-safe form helper utilities
 * Common patterns for form interactions
 */

/**
 * Fill a text input field with validation
 */
export async function fillTextField(
  locator: Locator,
  value: string,
  options: FillOptions = {}
): Promise<void> {
  const { clear = true, timeout = 10000 } = options;

  await expect(locator).toBeVisible({ timeout });
  await expect(locator).toBeEnabled({ timeout });

  if (clear) {
    await locator.clear();
  }

  await locator.fill(value);

  // Verify value was set
  await expect(locator).toHaveValue(value, { timeout: 2000 }).catch(() => {
    // Some inputs might not support value check, ignore
  });
}

/**
 * Fill a textarea field
 */
export async function fillTextarea(
  locator: Locator,
  value: string,
  options: FillOptions = {}
): Promise<void> {
  await fillTextField(locator, value, options);
}

/**
 * Select an option from a combobox/dropdown
 */
export async function selectOption(
  locator: Locator,
  option: SelectOption | string,
  timeout: number = 10000
): Promise<void> {
  await expect(locator).toBeVisible({ timeout });
  await expect(locator).toBeEnabled({ timeout });
  await locator.scrollIntoViewIfNeeded();

  // Click to open dropdown
  await locator.click();

  // Wait for dropdown options to appear
  const page = locator.page();
  let optionLocator: Locator;

  if (typeof option === 'string') {
    optionLocator = page.getByRole('option', { name: option });
  } else if (option.label) {
    optionLocator = page.getByRole('option', {
      name: option.label,
      exact: option.exact ?? false,
    });
  } else if (option.value) {
    optionLocator = page.locator(`option[value="${option.value}"]`);
  } else if (option.index !== undefined) {
    optionLocator = page.getByRole('option').nth(option.index);
  } else {
    throw new Error('Invalid select option: must provide label, value, or index');
  }

  await expect(optionLocator).toBeVisible({ timeout: 5000 });
  await optionLocator.click();
}

/**
 * Fill a spinbutton (number input)
 */
export async function fillSpinbutton(
  locator: Locator,
  value: string | number,
  options: FillOptions = {}
): Promise<void> {
  const { clear = true, timeout = 10000 } = options;
  const valueStr = String(value);

  await expect(locator).toBeVisible({ timeout });
  await expect(locator).toBeEnabled({ timeout });

  // Spinbuttons might need special handling
  // Try clear + fill first
  if (clear) {
    await locator.clear();
  }

  await locator.fill(valueStr);

  // Verify value (with retry for spinbuttons)
  let retries = 3;
  while (retries > 0) {
    const currentValue = await locator.inputValue();
    if (currentValue === valueStr) {
      return;
    }
    await locator.fill(valueStr);
    retries--;
    await locator.page().waitForTimeout(200);
  }
}

/**
 * Check/uncheck a checkbox
 */
export async function setCheckbox(
  locator: Locator,
  checked: boolean,
  timeout: number = 10000
): Promise<void> {
  await expect(locator).toBeVisible({ timeout });
  await expect(locator).toBeEnabled({ timeout });

  const isCurrentlyChecked = await locator.isChecked();
  if (isCurrentlyChecked !== checked) {
    await locator.click();
  }

  // Verify state
  await expect(locator).toHaveProperty('checked', checked, { timeout: 2000 });
}

/**
 * Fill multiple form fields in sequence
 */
export async function fillFormFields(
  page: Page,
  fields: Array<{
    locator: Locator;
    value: string | number | boolean;
    type?: 'text' | 'textarea' | 'spinbutton' | 'select' | 'checkbox';
    options?: FillOptions | SelectOption;
  }>
): Promise<void> {
  for (const field of fields) {
    const { locator, value, type = 'text', options } = field;

    switch (type) {
      case 'text':
        await fillTextField(locator, String(value), options as FillOptions);
        break;
      case 'textarea':
        await fillTextarea(locator, String(value), options as FillOptions);
        break;
      case 'spinbutton':
        await fillSpinbutton(locator, value as string | number, options as FillOptions);
        break;
      case 'select':
        await selectOption(
          locator,
          (options as SelectOption) || String(value),
          10000
        );
        break;
      case 'checkbox':
        await setCheckbox(locator, Boolean(value));
        break;
      default:
        throw new Error(`Unsupported field type: ${type}`);
    }
  }
}
