package com.devscribe.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

public final class SlugUtil {

    private static final Pattern NON_ALNUM = Pattern.compile("[^a-z0-9]+");
    private static final Pattern DIACRITICS = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");

    private SlugUtil() {
    }

    public static String toSlug(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String withoutDiacritics = DIACRITICS.matcher(normalized).replaceAll("");
        String lowered = withoutDiacritics.toLowerCase(Locale.ROOT).trim();
        String cleaned = NON_ALNUM.matcher(lowered).replaceAll("-");
        String slug = cleaned.replaceAll("^-+", "").replaceAll("-+$", "");
        return slug.isBlank() ? "post" : slug;
    }
}
