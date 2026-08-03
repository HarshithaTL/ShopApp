import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Must live outside the screen component to keep its identity stable across
// re-renders; otherwise every keystroke unmounts the TextInput and drops focus.
const Field = ({ label, field, placeholder, keyboardType = 'default', maxLength, form, errors, setForm, setErrors }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={[styles.input, errors[field] && styles.inputError]}
      placeholder={placeholder}
      placeholderTextColor="#bbb"
      value={form[field]}
      onChangeText={(v) => {
        setForm((f) => ({ ...f, [field]: v }));
        if (errors[field]) setErrors((e) => ({ ...e, [field]: null }));
      }}
      keyboardType={keyboardType}
      maxLength={maxLength}
      autoCorrect={false}
    />
    {errors[field] && <Text style={styles.errorMsg}>⚠ {errors[field]}</Text>}
  </View>
);

const DeliveryScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};

    if (!form.name.trim()) {
      e.name = 'Full name is required';
    } else if (form.name.trim().length < 2) {
      e.name = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(form.name.trim())) {
      e.name = 'Name can only contain letters and spaces';
    }

    if (!form.phone.trim()) {
      e.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(form.phone.trim())) {
      e.phone = 'Enter a valid 10-digit phone number';
    }

    if (!form.address.trim()) {
      e.address = 'Delivery address is required';
    } else if (form.address.trim().length < 10) {
      e.address = 'Please enter a more complete address';
    }

    if (!form.city.trim()) e.city = 'City is required';

    if (!form.pincode.trim()) {
      e.pincode = 'PIN code is required';
    } else if (!/^\d{6}$/.test(form.pincode.trim())) {
      e.pincode = 'Enter a valid 6-digit PIN code';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    navigation.navigate('Checkout', { delivery: form });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Delivery Details</Text>
            <Text style={styles.headerSub}>Step 1 of 2</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Where should we deliver?</Text>

            <Field label="Full Name *" field="name" placeholder="Enter your full name"
              form={form} errors={errors} setForm={setForm} setErrors={setErrors} />
            <Field
              label="Phone Number *" field="phone" placeholder="10-digit mobile number"
              keyboardType="numeric" maxLength={10}
              form={form} errors={errors} setForm={setForm} setErrors={setErrors}
            />
            <Field
              label="Delivery Address *" field="address" placeholder="House no., Street, Area"
              form={form} errors={errors} setForm={setForm} setErrors={setErrors}
            />
            <Field label="City *" field="city" placeholder="Enter your city"
              form={form} errors={errors} setForm={setForm} setErrors={setErrors} />
            <Field
              label="PIN Code *" field="pincode" placeholder="6-digit PIN code"
              keyboardType="numeric" maxLength={6}
              form={form} errors={errors} setForm={setForm} setErrors={setErrors}
            />
            <Field
              label="Order Notes (optional)" field="notes" placeholder="Any special instructions…"
              form={form} errors={errors} setForm={setForm} setErrors={setErrors}
            />
          </View>

          <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
            <Text style={styles.continueBtnText}>Continue to Review →</Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 18, color: '#333' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#1A1A2E' },
  headerSub: { fontSize: 12, color: '#2A7F7F', fontWeight: '600', marginTop: 1 },
  scroll: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 16,
  },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  inputError: { borderColor: '#E8554E', backgroundColor: '#FFF8F8' },
  errorMsg: { fontSize: 12, color: '#E8554E', marginTop: 4 },
  continueBtn: {
    backgroundColor: '#2A7F7F',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#2A7F7F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueBtnText: { color: '#fff', fontSize: 17, fontWeight: '900', letterSpacing: 0.5 },
});

export default DeliveryScreen;
