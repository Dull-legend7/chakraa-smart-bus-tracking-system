import { View, Text, StyleSheet, TextInput } from "react-native";
import React, { useMemo, useState } from "react";
import { useTheme } from "@react-navigation/native";
import fonts from "@/themes/app.fonts";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import color from "@/themes/app.colors";
import RNPickerSelect from "react-native-picker-select";

interface InputProps {
  title: string;
  placeholder: string;
  items: { label: string; value: string }[];
  value?: string;
  warning?: string;
  onValueChange: (value: string) => void;
  showWarning?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export default function SelectInput({
  title,
  placeholder,
  items,
  value,
  warning,
  onValueChange,
  showWarning,
  searchable,
  searchPlaceholder,
}: InputProps) {
  const { colors } = useTheme();
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchable || !search.trim()) {
      return items;
    }
    const term = search.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(term) ||
        item.value.toLowerCase().includes(term)
    );
  }, [items, searchable, search]);

  return (
    <View>
      {/* <Text style={[styles.title, { color: colors.text }]}>{title}</Text> */}
      {searchable && (
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={searchPlaceholder || "Search"}
          placeholderTextColor={color.subtitle}
          style={[
            styles.searchInput,
            {
              borderColor: colors.border,
            },
          ]}
        />
      )}
      <RNPickerSelect
        onValueChange={onValueChange}
        items={filteredItems}
        placeholder={{ label: value }}
        style={{
          inputIOS: {
            ...styles.input,
            backgroundColor: color.lightGray,
            borderColor: colors.border,
            height: windowHeight(39),
          },
          inputAndroid: {
            ...styles.input,
            backgroundColor: color.lightGray,
            borderColor: colors.border,
            height: windowHeight(39),
            color: "#000",
          },
        }}
        value={value}
      />
      {showWarning && <Text style={[styles.warning]}>{warning}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.medium,
    fontSize: windowWidth(20),
    marginVertical: windowHeight(8),
  },
  input: {
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: 5,
    height: windowHeight(30),
    color: color.secondaryFont,
    paddingHorizontal: 10,
  },
  warning: {
    color: color.red,
    marginTop: 3,
  },
  searchInput: {
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: windowHeight(6),
    height: windowHeight(35),
    color: color.secondaryFont,
    paddingHorizontal: 10,
    backgroundColor: color.lightGray,
  },
});
