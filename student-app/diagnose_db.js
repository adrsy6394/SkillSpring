import { supabase } from './src/lib/supabaseClient';

async function diagnose() {
  console.log("Starting diagnostics...");
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.log("No active session found.");
    return;
  }
  
  const userId = session.user.id;
  console.log("User ID:", userId);

  // 1. Check raw enrollments
  const { data: rawEnrollments, error: rawError } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', userId);
  
  if (rawError) {
    console.error("Raw enrollment fetch error:", rawError);
  } else {
    console.log("Raw enrollments count:", rawEnrollments.length);
  }

  // 2. Check courses
  const { data: rawCourses, error: courseError } = await supabase
    .from('courses')
    .select('id, title, status')
    .limit(5);

  if (courseError) {
    console.error("Course fetch error:", courseError);
  } else {
    console.log("Sample courses:", rawCourses);
  }

  // 3. Test the join used in getMyCourses
  const { data: joinedData, error: joinError } = await supabase
    .from('enrollments')
    .select(`
      id,
      course:courses!inner(id, title)
    `)
    .eq('user_id', userId);

  if (joinError) {
    console.error("Join fetch error (with !inner):", joinError);
  } else {
    console.log("Joined enrollments count (with !inner):", joinedData?.length);
  }

  // 4. Test without !inner
  const { data: joinedDataBasic, error: joinErrorBasic } = await supabase
    .from('enrollments')
    .select(`
      id,
      course:courses(id, title)
    `)
    .eq('user_id', userId);

  if (joinErrorBasic) {
    console.error("Join fetch error (without !inner):", joinErrorBasic);
  } else {
    console.log("Joined enrollments count (without !inner):", joinedDataBasic?.length);
    if (joinedDataBasic?.length > 0) {
        console.log("Sample join data:", joinedDataBasic[0]);
    }
  }
}

diagnose();
